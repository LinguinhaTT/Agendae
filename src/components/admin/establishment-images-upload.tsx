"use client";

import { createBrowserClient } from "@supabase/ssr";
import { ImageIcon, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { updateEstablishmentImages } from "@/server/actions/admin";

interface Props {
  establishmentId: string;
  currentLogoUrl: string | null;
  currentCoverUrl: string | null;
}

export function EstablishmentImagesUpload({
  establishmentId,
  currentLogoUrl,
  currentCoverUrl,
}: Props) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [coverUrl, setCoverUrl] = useState(currentCoverUrl);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function uploadFile(
    file: File,
    path: string,
    setUploading: (v: boolean) => void,
    setUrl: (url: string) => void
  ) {
    if (file.size > 5 * 1024 * 1024) {
      setError("Imagem deve ter no máximo 5MB");
      return;
    }
    setUploading(true);
    setError(null);
    setSaved(false);

    const _ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const { error: upErr, data } = await supabase.storage
      .from("establishment-assets")
      .upload(path, file, { upsert: true, contentType: file.type });

    setUploading(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }

    const { data: urlData } = supabase.storage.from("establishment-assets").getPublicUrl(data.path);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    setUrl(publicUrl);
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(
      file,
      `${establishmentId}/logo.${file.name.split(".").pop()}`,
      setUploadingLogo,
      setLogoUrl
    );
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(
      file,
      `${establishmentId}/cover.${file.name.split(".").pop()}`,
      setUploadingCover,
      setCoverUrl
    );
  }

  async function handleSave() {
    const result = await updateEstablishmentImages(logoUrl, coverUrl);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Logo */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Logo</p>
        <p className="text-xs text-muted-foreground">
          Imagem quadrada, recomendado 400×400px. Máx 5MB.
        </p>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl border border-white/10 bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              // biome-ignore lint/performance/noImgElement: storage URL, no optimization needed
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => logoRef.current?.click()}
              disabled={uploadingLogo}
              className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploadingLogo ? "Enviando..." : "Trocar logo"}
            </button>
            {logoUrl && (
              <button
                type="button"
                onClick={() => {
                  setLogoUrl(null);
                  setSaved(false);
                }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" /> Remover
              </button>
            )}
          </div>
        </div>
        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />
      </div>

      {/* Cover */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Foto de capa</p>
        <p className="text-xs text-muted-foreground">
          Imagem horizontal, recomendado 1200×400px. Máx 5MB.
        </p>
        <div className="rounded-xl border border-white/10 bg-muted overflow-hidden h-32 relative flex items-center justify-center">
          {coverUrl ? (
            // biome-ignore lint/performance/noImgElement: storage URL, no optimization needed
            <img
              src={coverUrl}
              alt="Capa"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity gap-2">
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              disabled={uploadingCover}
              className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploadingCover ? "Enviando..." : "Trocar capa"}
            </button>
            {coverUrl && (
              <button
                type="button"
                onClick={() => {
                  setCoverUrl(null);
                  setSaved(false);
                }}
                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-destructive/80 hover:bg-destructive transition-colors text-white"
              >
                <X className="h-3.5 w-3.5" /> Remover
              </button>
            )}
          </div>
        </div>
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />
        {!coverUrl && (
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            disabled={uploadingCover}
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploadingCover ? "Enviando..." : "Adicionar capa"}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
        >
          Salvar imagens
        </button>
        {saved && <span className="text-sm text-green-400">Salvo!</span>}
      </div>
    </div>
  );
}
