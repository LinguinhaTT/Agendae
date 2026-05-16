"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateMemberAvatar } from "@/server/actions/team";

interface Props {
  memberId: string;
  currentUrl: string | null;
  displayName: string;
}

export function AvatarUpload({ memberId, currentUrl, displayName }: Props) {
  const [url, setUrl] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.has(ext)) {
      setError("Formato não permitido. Use JPG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Imagem deve ter no máximo 2 MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const path = `${memberId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError("Erro ao enviar imagem.");
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      const result = await updateMemberAvatar(memberId, publicUrl);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setUrl(publicUrl);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="relative w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center group disabled:opacity-70"
        title="Alterar foto"
      >
        {url ? (
          <Image src={url} alt={displayName} fill className="object-cover" unoptimized />
        ) : (
          <span className="text-xl font-bold text-primary">{initials}</span>
        )}
        <span className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
          {uploading ? "..." : "Alterar"}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  );
}
