"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Star, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  addPortfolioItem,
  deletePortfolioItem,
  toggleFeaturedPortfolio,
} from "@/server/actions/admin";

interface PortfolioItem {
  id: string;
  image_url: string;
  title: string | null;
  is_featured: boolean;
}

interface Props {
  establishmentId: string;
  initialItems: PortfolioItem[];
}

export function PortfolioManager({ establishmentId, initialItems }: Props) {
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);

    const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED_EXT.has(ext)) {
        setError(`${file.name}: formato não permitido. Use JPG, PNG, WebP ou GIF.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} excede 10MB`);
        continue;
      }
      const path = `${establishmentId}/portfolio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: upErr, data } = await supabase.storage
        .from("establishment-assets")
        .upload(path, file, { contentType: file.type });

      if (upErr) {
        setError(upErr.message);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("establishment-assets")
        .getPublicUrl(data.path);
      const result = await addPortfolioItem(urlData.publicUrl);
      if (result.ok) {
        setItems((prev) => [
          { id: result.data.id, image_url: urlData.publicUrl, title: null, is_featured: false },
          ...prev,
        ]);
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta foto do portfólio?")) return;
    setDeleting(id);
    await deletePortfolioItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeleting(null);
  }

  async function handleToggleFeatured(id: string, current: boolean) {
    await toggleFeaturedPortfolio(id, !current);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_featured: !current } : i)));
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Upload button */}
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-50 font-medium"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Enviando..." : "Adicionar fotos"}
        </button>
        <p className="text-xs text-muted-foreground mt-1.5">
          Múltiplas fotos permitidas. Máx 10MB cada.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma foto no portfólio ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-xl overflow-hidden border border-white/5 aspect-square bg-muted"
            >
              <Image
                src={item.image_url}
                alt={item.title ?? "Portfolio"}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  title={item.is_featured ? "Remover destaque" : "Destacar"}
                  onClick={() => handleToggleFeatured(item.id, item.is_featured)}
                  className={`p-2 rounded-lg transition-colors ${item.is_featured ? "bg-yellow-500/80 text-white" : "bg-white/10 text-white hover:bg-yellow-500/80"}`}
                >
                  <Star className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Remover"
                  disabled={deleting === item.id}
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg bg-destructive/80 text-white hover:bg-destructive transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {item.is_featured && (
                <div className="absolute top-2 left-2 bg-yellow-500 rounded-full p-1">
                  <Star className="h-3 w-3 text-white fill-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
