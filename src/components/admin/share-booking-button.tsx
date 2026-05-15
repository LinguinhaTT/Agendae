"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

interface Props {
  slug: string;
  establishmentName: string;
}

export function ShareBookingButton({ slug, establishmentName }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/e/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Agende com ${establishmentName}`,
          text: `Agende seu horário em ${establishmentName} 👇`,
          url,
        });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Compartilhar link de agendamento"
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copiado!
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          Compartilhar
        </>
      )}
    </button>
  );
}
