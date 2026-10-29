import Header from "@/components/common/Header";
import ThemeProvider from "@/components/marketing/ThemeProvider";

/**
 * Wraps the whole aluno area (home, aula, perfil) in the same ThemeProvider
 * login/register already use — one shared "pullse-home-theme" localStorage
 * key, so a preference set anywhere carries across the app. Deliberately
 * overrides DESIGN.md's original "admin/aluno stay light" default per an
 * explicit request; the tradeoff was confirmed before implementing.
 */
export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <div className="bg-surface min-h-dvh">
        <Header />
        <main className="my-10 flex justify-center px-6">{children}</main>
      </div>
    </ThemeProvider>
  );
}
