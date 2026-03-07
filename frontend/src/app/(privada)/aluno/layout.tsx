import Header from "@/components/common/Header";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <main className="my-10 flex flex-col items-center gap-10 px-6">
        {children}
      </main>
    </div>
  );
}
