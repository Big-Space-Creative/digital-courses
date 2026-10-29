import Header from "@/components/common/Header";
import ThemeProvider from "@/components/marketing/ThemeProvider";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <div className="bg-canvas text-text flex min-h-dvh flex-col transition-colors">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
