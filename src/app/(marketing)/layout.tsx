import Link from "next/link";
import { Button } from "@/components/ui/button";

function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-md bg-background/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-black">IB</span>
          </div>
          InkBook
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/#funcionalidades" className="hover:text-foreground transition-colors">
            Funcionalidades
          </Link>
          <Link href="/#como-funciona" className="hover:text-foreground transition-colors">
            Como funciona
          </Link>
          <Link href="/precos" className="hover:text-foreground transition-colors">
            Preços
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/entrar">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/cadastro">Criar conta grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 mt-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-black">IB</span>
              </div>
              InkBook
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Agendamento online para tatuadores, barbeiros e profissionais de estética.
            </p>
          </div>

          <div>
            <p className="font-medium text-sm mb-3">Produto</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#funcionalidades" className="hover:text-foreground transition-colors">
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link href="/precos" className="hover:text-foreground transition-colors">
                  Preços
                </Link>
              </li>
              <li>
                <Link href="/#como-funciona" className="hover:text-foreground transition-colors">
                  Como funciona
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-sm mb-3">Conta</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/entrar" className="hover:text-foreground transition-colors">
                  Entrar
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className="hover:text-foreground transition-colors">
                  Criar conta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-sm mb-3">Legal</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/termos" className="hover:text-foreground transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-foreground transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} InkBook. Todos os direitos reservados.</p>
          <p>Feito com ♥ no Brasil 🇧🇷</p>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
