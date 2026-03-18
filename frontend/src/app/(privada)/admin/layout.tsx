import Sidebar from "./components/Sidebar";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="h-screen w-full overflow-scroll">{children}</main>
    </div>
  );
}
