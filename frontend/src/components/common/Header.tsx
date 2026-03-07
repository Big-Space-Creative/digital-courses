import Image from "next/image";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="bg-secondary flex items-center justify-between px-6 py-4 md:px-20">
      <Logo />
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <p className="text-base text-white">Arthur</p>
          <p className="text-sm text-white/60">Plano premium</p>
        </div>
        <div className="border-primary relative size-15 overflow-hidden rounded-full border-2">
          <Image
            src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="foto"
            fill
            className="object-cover"
            quality={60}
          />
        </div>
      </div>
    </header>
  );
}
