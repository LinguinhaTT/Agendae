import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de Uso do Agendaê — leia antes de usar a plataforma.",
};

export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-black mb-2">Termos de Uso</h1>
      <p className="text-muted-foreground text-sm mb-12">
        Última atualização: 1º de janeiro de 2025
      </p>

      <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold">1. Aceitação dos Termos</h2>
          <p className="text-muted-foreground">
            Ao acessar ou usar a plataforma Agendaê, você concorda com estes Termos de Uso. Se não
            concordar, não utilize o serviço. O uso continuado após alterações constitui aceitação
            dos novos termos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">2. Descrição do Serviço</h2>
          <p className="text-muted-foreground">
            O Agendaê é uma plataforma de agendamento online que conecta profissionais de estética,
            tatuagem e beleza com seus clientes. O serviço inclui gestão de agenda, envio de
            lembretes, portfólio, avaliações e relatórios.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">3. Cadastro e Conta</h2>
          <p className="text-muted-foreground">
            Você deve ter pelo menos 18 anos para criar uma conta. É responsável por manter a
            confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta.
            Informe dados verdadeiros e atualizados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">4. Uso Aceitável</h2>
          <p className="text-muted-foreground">É proibido usar o Agendaê para:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Atividades ilegais ou fraudulentas</li>
            <li>Spam ou comunicações não solicitadas em massa</li>
            <li>Coletar dados de outros usuários sem consentimento</li>
            <li>Prejudicar a infraestrutura da plataforma</li>
            <li>Revender ou sublicenciar o acesso ao serviço</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">5. Pagamentos e Planos</h2>
          <p className="text-muted-foreground">
            Os planos pagos são cobrados mensalmente com renovação automática. Cancelamentos
            solicitados até 24h antes da renovação terão efeito no próximo ciclo. Não há reembolso
            proporcional pelo período não utilizado, exceto por falha técnica comprovada nossa.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">6. Propriedade Intelectual</h2>
          <p className="text-muted-foreground">
            Todo o conteúdo da plataforma (código, design, marca, textos) pertence ao Agendaê. Ao
            publicar conteúdo (fotos de portfólio, descrições), você nos concede licença não
            exclusiva para exibi-lo na plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">7. Limitação de Responsabilidade</h2>
          <p className="text-muted-foreground">
            O Agendaê não se responsabiliza por: perdas indiretas ou consequentes; falhas de
            terceiros (processadores de pagamento, provedores de SMS/WhatsApp); conteúdo publicado
            por usuários; ou perda de negócio por indisponibilidade do serviço.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">8. Disponibilidade</h2>
          <p className="text-muted-foreground">
            Buscamos manter a plataforma disponível 24/7, mas não garantimos uptime de 100%.
            Manutenções programadas serão comunicadas com antecedência sempre que possível.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">9. Encerramento de Conta</h2>
          <p className="text-muted-foreground">
            Você pode encerrar sua conta a qualquer momento pelo painel. Reservamo-nos o direito de
            suspender ou encerrar contas que violem estes termos, sem aviso prévio em casos graves.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">10. Alterações nos Termos</h2>
          <p className="text-muted-foreground">
            Podemos atualizar estes termos periodicamente. Notificaremos por email sobre mudanças
            significativas. O uso continuado da plataforma após a notificação constitui aceitação.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">11. Lei Aplicável</h2>
          <p className="text-muted-foreground">
            Estes termos são regidos pela legislação brasileira. Fica eleito o foro da Comarca de
            São Paulo/SP para dirimir quaisquer controvérsias.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">12. Contato</h2>
          <p className="text-muted-foreground">
            Dúvidas sobre estes termos:{" "}
            <a href="mailto:legal@Agendaê.app" className="text-primary hover:underline">
              legal@Agendaê.app
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
