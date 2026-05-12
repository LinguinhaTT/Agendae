"use client";

import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <Card className="w-full max-w-md glass-card border-white/10 text-center">
      <CardContent className="pt-8 pb-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold">Verifique seu email</h2>
          <p className="text-muted-foreground text-sm">
            Enviamos um link de confirmação para{" "}
            {email ? <span className="font-medium text-foreground">{email}</span> : "seu email"}.
            Clique no link para ativar sua conta.
          </p>
        </div>

        <div className="bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground space-y-1">
          <p>Não recebeu o email?</p>
          <p>Verifique sua caixa de spam ou lixo eletrônico.</p>
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link href="/entrar">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao login
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense>
      <VerificarEmailContent />
    </Suspense>
  );
}
