import Sidebar from "./components/Sidebar";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="w-full overflow-x-hidden lg:h-screen lg:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
