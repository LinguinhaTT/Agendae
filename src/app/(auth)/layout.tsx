import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-mesh flex flex-col">
      <header className="p-4 flex justify-center">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-black">IB</span>
          </div>
          InkBook
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">{children}</main>

      <footer className="p-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} InkBook. Todos os direitos reservados.
      </footer>
    </div>
  );
}
