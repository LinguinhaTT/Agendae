"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function NavBar() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(5,8,22,0)", "rgba(5,8,22,0.85)"]);
  const navBorder = useTransform(
    scrollY,
    [0, 80],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.06)"]
  );

  return (
    <motion.header
      style={{ backgroundColor: navBg, borderColor: navBorder }}
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-shadow"
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <span className="text-white">Agendaê</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {[
            { label: "Funcionalidades", href: "/#funcionalidades" },
            { label: "Como funciona", href: "/#como-funciona" },
            { label: "Preços", href: "/precos" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/entrar"
            className="px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="px-4 py-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Criar conta grátis
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-1"
        >
          {[
            { label: "Funcionalidades", href: "/#funcionalidades" },
            { label: "Como funciona", href: "/#como-funciona" },
            { label: "Preços", href: "/precos" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-white/5 pt-3 mt-2 flex flex-col gap-2">
            <Link
              href="/entrar"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm text-center border border-white/10 hover:bg-white/[0.06] transition-all"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground text-center hover:brightness-110 transition-all"
            >
              Criar conta grátis
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 pt-16 pb-8 mt-0">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-base mb-3 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <Calendar className="h-3.5 w-3.5 text-white" />
              </div>
              <span>Agendaê</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Agendamento online para tatuadores, barbeiros e profissionais de estética.
            </p>
          </div>

          <div>
            <p className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Produto
            </p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
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
            <p className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Conta
            </p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
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
            <p className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Legal
            </p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
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
          <p>© {new Date().getFullYear()} Agendaê. Todos os direitos reservados.</p>
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
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </>
  );
}
