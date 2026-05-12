import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EstablishmentNotFound() {
  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
          <span className="text-3xl">🔍</span>
        </div>
        <h1 className="text-2xl font-bold">Estabelecimento não encontrado</h1>
        <p className="text-muted-foreground text-sm">
          O link que você acessou pode estar incorreto ou o estabelecimento pode ter mudado seu
          endereço.
        </p>
        <Button asChild className="w-full">
          <Link href="/">Ir para o InkBook</Link>
        </Button>
      </div>
    </div>
  );
}
