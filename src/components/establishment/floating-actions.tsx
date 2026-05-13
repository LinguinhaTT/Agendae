"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  slug: string;
  phone?: string | null;
  whatsapp?: string | null;
  establishmentName: string;
}

export function FloatingActions({ slug, phone, whatsapp, establishmentName }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 180);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const rawPhone = (whatsapp ?? phone ?? "").replace(/\D/g, "");
  const waPhone = rawPhone.startsWith("55") ? rawPhone : `55${rawPhone}`;
  const waUrl = rawPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`Olá! Vi o perfil de ${establishmentName} no Agendaê e gostaria de mais informações.`)}`
    : null;

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {/* WhatsApp button */}
      <AnimatePresence>
        {scrolled && waUrl && (
          <motion.a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.4, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.4, x: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-transform"
            title="Falar no WhatsApp"
          >
            {/* Pulse rings */}
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-15 animation-delay-300" />
            <MessageCircle className="h-6 w-6 text-white fill-white relative z-10" />
          </motion.a>
        )}
      </AnimatePresence>

      {/* Book button — always visible */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        className="pointer-events-auto"
      >
        <Link
          href={`/e/${slug}/agendar`}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 hover:brightness-110 active:scale-95 transition-all"
        >
          <CalendarPlus className="h-4 w-4" />
          Agendar agora
        </Link>
      </motion.div>
    </div>
  );
}
