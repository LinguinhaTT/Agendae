import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de Privacidade do Agendaê — como coletamos e usamos seus dados.",
};

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-black mb-2">Política de Privacidade</h1>
      <p className="text-muted-foreground text-sm mb-12">
        Última atualização: 1º de janeiro de 2025
      </p>

      <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold">1. Introdução</h2>
          <p className="text-muted-foreground">
            O Agendaê está comprometido com a proteção de seus dados pessoais, em conformidade com a
            Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Esta política explica quais
            dados coletamos, como os usamos e seus direitos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">2. Dados que Coletamos</h2>
          <p className="text-muted-foreground font-medium">Dados fornecidos por você:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Nome, email e telefone (cadastro)</li>
            <li>Informações do estabelecimento (nome, endereço, categoria)</li>
            <li>Fotos de portfólio</li>
            <li>Dados de clientes inseridos na plataforma</li>
          </ul>
          <p className="text-muted-foreground font-medium mt-3">Dados coletados automaticamente:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Endereço IP e dados de dispositivo</li>
            <li>Cookies de sessão e preferências</li>
            <li>Logs de uso e erros</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">3. Como Usamos seus Dados</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Operar e melhorar a plataforma</li>
            <li>Enviar lembretes de agendamento e notificações</li>
            <li>Processar pagamentos de assinaturas</li>
            <li>Suporte ao cliente</li>
            <li>Análise de uso para melhorias do produto</li>
            <li>Cumprimento de obrigações legais</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">4. Base Legal (LGPD)</h2>
          <p className="text-muted-foreground">Processamos seus dados com base em:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Contrato:</strong> para prestar os serviços contratados
            </li>
            <li>
              <strong>Consentimento:</strong> para marketing e comunicações opcionais
            </li>
            <li>
              <strong>Interesse legítimo:</strong> para segurança e prevenção de fraudes
            </li>
            <li>
              <strong>Obrigação legal:</strong> para cumprimento de legislação aplicável
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">5. Compartilhamento de Dados</h2>
          <p className="text-muted-foreground">
            Não vendemos seus dados. Compartilhamos apenas com:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Supabase:</strong> banco de dados e autenticação (Brasil/EUA)
            </li>
            <li>
              <strong>Resend:</strong> envio de emails transacionais
            </li>
            <li>
              <strong>Stripe:</strong> processamento de pagamentos
            </li>
            <li>
              <strong>Twilio:</strong> envio de SMS (plano Business)
            </li>
          </ul>
          <p className="text-muted-foreground">
            Todos os parceiros são contratualmente obrigados a proteger seus dados e estão em
            conformidade com LGPD/GDPR.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">6. Retenção de Dados</h2>
          <p className="text-muted-foreground">
            Mantemos seus dados enquanto sua conta estiver ativa. Após o encerramento, os dados são
            mantidos por 90 dias para recuperação e depois anonimizados ou excluídos, salvo
            obrigação legal de retenção maior.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">7. Cookies</h2>
          <p className="text-muted-foreground">
            Usamos cookies essenciais (sessão, autenticação) e analíticos (comportamento de uso).
            Você pode desativar cookies analíticos nas configurações do navegador sem afetar o
            funcionamento básico da plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">8. Seus Direitos (LGPD)</h2>
          <p className="text-muted-foreground">Você tem direito a:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Confirmar a existência de tratamento dos seus dados</li>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou desatualizados</li>
            <li>Solicitar a exclusão (direito ao esquecimento)</li>
            <li>Revogar consentimentos</li>
            <li>Portabilidade dos seus dados</li>
            <li>Ser informado sobre compartilhamentos</li>
          </ul>
          <p className="text-muted-foreground">
            Para exercer esses direitos, entre em contato:{" "}
            <a href="mailto:privacidade@Agendaê.app" className="text-primary hover:underline">
              privacidade@Agendaê.app
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">9. Segurança</h2>
          <p className="text-muted-foreground">
            Adotamos medidas técnicas e organizacionais para proteger seus dados: criptografia em
            trânsito (TLS 1.3), autenticação de dois fatores disponível, logs de auditoria, acesso
            restrito por função (RLS), e revisões periódicas de segurança.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">10. Menores de Idade</h2>
          <p className="text-muted-foreground">
            Não coletamos dados de menores de 18 anos. Se identificarmos tal situação, os dados
            serão imediatamente excluídos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">11. Alterações nesta Política</h2>
          <p className="text-muted-foreground">
            Quando houver mudanças relevantes, notificaremos por email. A data de atualização acima
            indica a versão atual.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">12. Contato — DPO</h2>
          <p className="text-muted-foreground">
            Encarregado de Proteção de Dados (DPO):{" "}
            <a href="mailto:privacidade@Agendaê.app" className="text-primary hover:underline">
              privacidade@Agendaê.app
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
