import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { UserProvider } from "@/context/UserContext";
import { getUserFromToken } from "./actions/user";
import CookieBanner from "@/components/ui/CookieBanner";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🎸 AulasViolão — Aprenda violão do zero ao avançado",
  description:
    "Plataforma de cursos de violão com trilhas progressivas, material de apoio e acompanhamento de progresso. Do iniciante ao avançado.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserFromToken();

  return (
    <html lang="pt-BR">
      <body className={`${lexend.variable} antialiased`}>
        <UserProvider initialUser={user}>
          <ToastProvider>{children}</ToastProvider>
        </UserProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
