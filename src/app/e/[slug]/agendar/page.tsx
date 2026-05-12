import { ArrowLeft, Construction } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getEstablishmentBySlug } from "@/lib/data/establishment";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgendarPage({ params }: Props) {
  const { slug } = await params;
  const data = await getEstablishmentBySlug(slug);

  if (!data) notFound();

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Construction className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Agendamento em breve</h1>
        <p className="text-muted-foreground text-sm">
          O fluxo de agendamento de{" "}
          <span className="font-medium text-foreground">{data.establishment.name}</span> está sendo
          configurado. Em breve você poderá agendar diretamente por aqui.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/e/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao perfil
          </Link>
        </Button>
      </div>
    </div>
  );
}
