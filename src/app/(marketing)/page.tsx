"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  Check,
  Clock,
  Shield,
  Smartphone,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

// ─── Easing ───────────────────────────────────────────────────────────────────
const FILM: [number, number, number, number] = [0.16, 1, 0.3, 1];
const BREATH: [number, number, number, number] = [0.37, 0, 0.63, 1];
const POP: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

// ─── Variants ─────────────────────────────────────────────────────────────────
const featureContainerV: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const featureCardV: Variants = {
  hidden: (col: number) => ({
    opacity: 0,
    y: col === 1 ? 70 : 45,
    x: col === 0 ? -35 : col === 2 ? 35 : 0,
    scale: 0.92,
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: { duration: 0.85, ease: FILM },
  },
};
const stepContainerV: Variants = {
  hidden: {},
  visible: (i: number) => ({
    transition: { staggerChildren: 0.15, delayChildren: i * 0.15 },
  }),
};
const stepCircleV: Variants = {
  hidden: { scale: 0, opacity: 0, rotate: -90 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 200, damping: 12 },
  },
};
const stepTextV: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: FILM } },
};
const stepDescV: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: FILM } },
};
const checklistV: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.5 } },
};
const checkItemV: Variants = {
  hidden: { opacity: 0, x: -22 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: FILM } },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Calendar,
    title: "Agendamento 24/7",
    description:
      "Seus clientes agendam corte, barba ou serviço a qualquer hora, pelo celular, sem precisar te chamar no WhatsApp.",
  },
  {
    icon: Bell,
    title: "Lembretes automáticos",
    description:
      "Confirmação automática no ato do agendamento + lembrete 24h antes. Reduza faltas em até 70%.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e métricas",
    description:
      "Acompanhe faturamento, serviços mais populares, horários de pico e histórico de cada cliente.",
  },
  {
    icon: Star,
    title: "Avaliações integradas",
    description:
      "Colete avaliações automaticamente após cada atendimento e construa sua reputação online.",
  },
  {
    icon: Smartphone,
    title: "Link de agendamento",
    description:
      "Sua barbearia ou salão com página própria e link único. Coloque na bio do Instagram e pronto.",
  },
  {
    icon: Shield,
    title: "Sem duplo agendamento",
    description:
      "Bloqueio automático de horários ocupados por barbeiro ou cadeira. Nunca mais conflito de agenda.",
  },
];
const STEPS = [
  {
    number: "01",
    title: "Crie sua conta grátis",
    description: "Cadastre sua barbearia ou salão em menos de 2 minutos. Sem cartão de crédito.",
  },
  {
    number: "02",
    title: "Adicione seus profissionais",
    description:
      "Cadastre barbeiros e cabeleireiros com seus serviços, preços e horários de atendimento.",
  },
  {
    number: "03",
    title: "Compartilhe seu link",
    description:
      "Coloque o link na bio do Instagram, no status do WhatsApp e onde seus clientes estão.",
  },
  {
    number: "04",
    title: "Receba agendamentos",
    description:
      "Clientes escolhem barbeiro, serviço e horário sozinhos. Você só aparece e atende.",
  },
];
const PLANS = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "/mês",
    description: "Para testar sem compromisso",
    features: [
      "1 barbeiro ou cabeleireiro",
      "30 agendamentos/mês",
      "Página de agendamento",
      "Lembretes por email",
    ],
    cta: "Começar grátis",
    href: "/cadastro",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    description: "Para barbearias e salões",
    features: [
      "Até 5 profissionais",
      "Agendamentos ilimitados",
      "Lembretes por WhatsApp",
      "Avaliações e portfólio",
      "Relatórios de faturamento",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    href: "/cadastro",
    highlight: true,
  },
  {
    name: "Business",
    price: "R$ 149",
    period: "/mês",
    description: "Para redes e franquias",
    features: [
      "Profissionais ilimitados",
      "Agendamentos ilimitados",
      "Todos os canais de notificação",
      "Múltiplas unidades",
      "Relatórios avançados por unidade",
      "API e integrações",
      "Subdomínio personalizado",
    ],
    cta: "Assinar Business",
    href: "/cadastro",
    highlight: false,
  },
];
const TESTIMONIALS = [
  {
    name: "Diego Almeida",
    role: "Dono de Barbearia",
    studio: "Barbearia Black Label",
    initials: "DA",
    color: "from-blue-500 to-indigo-600",
    quote:
      "Tinha 3 barbeiros e o WhatsApp era um caos. Hoje os clientes agendam direto, sem me chamar. Faturei 35% a mais no primeiro mês.",
  },
  {
    name: "Fernanda Costa",
    role: "Cabeleireira",
    studio: "Salão FC Studio",
    initials: "FC",
    color: "from-violet-500 to-purple-600",
    quote:
      "Coloquei o link na bio do Instagram e em uma semana já tinha agenda cheia para o mês inteiro. Simplesmente incrível.",
  },
  {
    name: "Lucas Mendes",
    role: "Barbeiro autônomo",
    studio: "Barbearia Corte Certo",
    initials: "LM",
    color: "from-emerald-500 to-teal-600",
    quote:
      "Os lembretes automáticos cortaram minhas faltas pela metade. Paro de perder dinheiro com buraco na agenda.",
  },
];
const PARTICLES = [
  { x: 12, y: 22, s: 2, d: 5.8, delay: 0.0 },
  { x: 74, y: 14, s: 1.5, d: 4.5, delay: 0.9 },
  { x: 38, y: 62, s: 3, d: 6.5, delay: 1.6 },
  { x: 86, y: 44, s: 1, d: 4.0, delay: 0.3 },
  { x: 60, y: 80, s: 2.5, d: 5.5, delay: 2.2 },
  { x: 24, y: 70, s: 1.5, d: 4.2, delay: 1.1 },
  { x: 91, y: 19, s: 2, d: 6.8, delay: 0.6 },
  { x: 54, y: 36, s: 1, d: 3.5, delay: 1.9 },
  { x: 9, y: 52, s: 3, d: 7.2, delay: 0.2 },
  { x: 78, y: 68, s: 1.5, d: 5.1, delay: 1.4 },
  { x: 33, y: 9, s: 2, d: 4.9, delay: 0.8 },
  { x: 66, y: 91, s: 1, d: 3.8, delay: 2.5 },
  { x: 50, y: 4, s: 2.5, d: 6.1, delay: 0.5 },
  { x: 7, y: 84, s: 1.5, d: 4.7, delay: 1.8 },
  { x: 94, y: 73, s: 1, d: 5.4, delay: 0.1 },
];
const PROOF_ITEMS = [
  { Icon: Users, text: "+800 barbearias e salões", fill: false },
  { Icon: Calendar, text: "+15.000 agendamentos/mês", fill: false },
  { Icon: Star, text: "4.9/5 de avaliação média", fill: true },
  { Icon: Clock, text: "2 minutos para configurar", fill: false },
];

const SCENE_DURATION_MS = 3600;

const STORY = [
  {
    tag: "O Problema",
    tagCls: "bg-red-500/12 border-red-500/25 text-red-400",
    lines: ["Você corta cabelo,", "não gerencia", "WhatsApp."],
    sub: "Dezenas de mensagens por dia. Clientes sem resposta. Horários perdidos.",
  },
  {
    tag: "A Solução",
    tagCls: "bg-blue-500/12 border-blue-500/25 text-blue-400",
    lines: ["Cliente agenda", "o corte sozinho,", "em 30 segundos."],
    sub: "Escolhe o barbeiro, o serviço e o horário. Você só aparece e atende.",
  },
  {
    tag: "O Resultado",
    tagCls: "bg-emerald-500/12 border-emerald-500/25 text-emerald-400",
    lines: ["Cadeira cheia.", "Faturamento", "crescendo."],
    sub: "+35% de receita no primeiro mês. Sem faltas, sem buraco na agenda.",
  },
];
const INTRO_SCENE_MS = 2500;

// ─── Demo Scenes ──────────────────────────────────────────────────────────────

const WA_MSGS = [
  { text: "Tem vaga pra corte amanhã cedo? 🙏", from: "Carlos M." },
  { text: "Quanto tá o corte + barba?", from: "Bruno T." },
  { text: "Oi, quero marcar pra sexta, tem?", from: "Rafael S." },
  { text: "Me esqueci do horário, que horas era?", from: "João P." },
];

function SceneProblema() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, filter: "blur(6px)" }}
      transition={{ duration: 0.4, ease: FILM }}
      className="space-y-2.5"
    >
      {/* Camera shake wrapper */}
      <motion.div
        animate={{ x: [0, -2.5, 3, -1.5, 2, -1, 0], y: [0, 1, -1, 1.5, -1, 0] }}
        transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, delay: 0.6, ease: "linear" }}
      >
        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-emerald-500/8 border border-emerald-500/15 relative">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-sm font-black text-white select-none">
              W
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: POP }}
            >
              <span className="text-[7px] font-black text-white">47</span>
            </motion.div>
          </div>
          <div>
            <p className="text-xs font-bold text-white">WhatsApp</p>
            <p className="text-[10px] text-red-400 font-semibold">mensagens não respondidas 😩</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {WA_MSGS.map((msg, i) => (
            <motion.div
              key={msg.from}
              initial={{ opacity: 0, x: -16, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.28, duration: 0.35, ease: FILM }}
              className="bg-white/6 rounded-2xl rounded-tl-sm px-3 py-1.5 max-w-[92%]"
            >
              <p className="text-[9px] text-primary/80 font-bold mb-0.5">{msg.from}</p>
              <p className="text-[10px] text-white/65">{msg.text}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-[11px] text-red-400/80 pt-1"
        >
          Horas perdidas gerenciando mensagens...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

const SERVICES_DEMO = [
  { name: "Corte + Barba", price: "R$ 55", sel: true },
  { name: "Corte social", price: "R$ 35", sel: false },
  { name: "Barba completa", price: "R$ 30", sel: false },
];
const TIMES_DEMO = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];

function SceneAgendamento() {
  const [picking, setPicking] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPicking(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, filter: "blur(6px)" }}
      transition={{ duration: 0.4, ease: FILM }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <span className="text-[9px] font-black text-white">RS</span>
        </div>
        <div>
          <p className="text-xs font-bold text-white">Barbearia Black Label</p>
          <p className="text-[10px] text-primary">agendae.app/barbearia-black</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!picking ? (
          <motion.div key="services" exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.28 }}>
            <p className="text-[10px] text-white/40 mb-2">Escolha o serviço</p>
            {SERVICES_DEMO.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.11, duration: 0.32, ease: FILM }}
                className={`flex items-center justify-between p-2.5 rounded-xl border mb-1.5 ${
                  s.sel ? "bg-primary/10 border-primary/30" : "bg-white/[0.03] border-white/6"
                }`}
              >
                <span
                  className={`text-[11px] font-medium ${s.sel ? "text-white" : "text-white/55"}`}
                >
                  {s.name}
                </span>
                <span
                  className={`text-[10px] font-bold ${s.sel ? "text-primary" : "text-white/30"}`}
                >
                  {s.price}
                </span>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="times"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: FILM }}
          >
            <p className="text-[10px] text-white/40 mb-2">Escolha o horário</p>
            <div className="grid grid-cols-3 gap-1.5">
              {TIMES_DEMO.map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.055, duration: 0.28, ease: POP }}
                  className={`text-center py-2 rounded-xl text-[11px] font-semibold border ${
                    i === 2
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                      : "bg-white/[0.04] text-white/50 border-white/6"
                  }`}
                >
                  {t}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CountingNumber({ from, to, prefix = "" }: { from: number; to: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = performance.now();
    const dur = 1100;
    function tick(now: number) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - (1 - t) ** 3;
      if (el)
        el.textContent = prefix + Math.round(from + eased * (to - from)).toLocaleString("pt-BR");
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [from, to, prefix]);
  return (
    <span ref={ref}>
      {prefix}
      {from}
    </span>
  );
}

function SceneConfirmado() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
      transition={{ duration: 0.45, ease: FILM }}
      className="space-y-2.5"
    >
      <motion.div
        className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center"
        initial={{ y: 14 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.08, duration: 0.45, ease: FILM }}
      >
        <motion.div
          className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2"
          initial={{ scale: 0, rotate: -120 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.18, type: "spring", stiffness: 240, damping: 14 }}
        >
          <Check className="w-6 h-6 text-emerald-400" />
        </motion.div>
        <p className="text-sm font-bold text-white mb-0.5">Agendado com sucesso! ✨</p>
        <p className="text-[10px] text-emerald-400 font-medium">Corte + Barba · Qui 16, 13:00</p>
      </motion.div>

      <motion.div
        className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 flex items-center gap-2.5"
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.68, duration: 0.4, ease: FILM }}
      >
        <motion.div
          className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ delay: 0.85, duration: 0.4, ease: POP }}
        >
          <Bell className="w-3.5 h-3.5 text-primary" />
        </motion.div>
        <div>
          <p className="text-[10px] font-bold text-white">Você recebeu um agendamento!</p>
          <p className="text-[9px] text-white/40">Carlos M. · Qui 16, 13:00 · R$ 55</p>
        </div>
      </motion.div>

      <motion.div
        className="rounded-xl bg-white/[0.03] border border-white/5 p-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05, duration: 0.38, ease: FILM }}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-white/40">Faturamento hoje</p>
          <TrendingUp className="w-3 h-3 text-emerald-400" />
        </div>
        <p className="text-base font-black text-white">
          <CountingNumber from={780} to={1080} prefix="R$ " />
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── LiveDemoMockup ───────────────────────────────────────────────────────────
const SCENE_LABELS = ["Problema", "Solução", "Resultado"];

function LiveDemoMockup({ scene: extScene }: { scene?: number }) {
  const [internalScene, setInternalScene] = useState(0);
  const scene = extScene ?? internalScene;
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const sX = useSpring(mouseX, { stiffness: 28, damping: 14, mass: 1.5 });
  const sY = useSpring(mouseY, { stiffness: 28, damping: 14, mass: 1.5 });
  const frameX = useTransform(sX, [0, 1], [-8, 8]);
  const frameY = useTransform(sY, [0, 1], [-5, 5]);

  // 3D rotation on scene change
  const rotY = useMotionValue(0);
  const sRotY = useSpring(rotY, { stiffness: 140, damping: 14, mass: 1.1 });

  useEffect(() => {
    if (extScene !== undefined) return;
    const t = setInterval(() => setInternalScene((s) => (s + 1) % 3), SCENE_DURATION_MS);
    return () => clearInterval(t);
  }, [extScene]);

  useEffect(() => {
    if (extScene === undefined) return;
    rotY.set(22);
    const t = setTimeout(() => rotY.set(0), 480);
    return () => clearTimeout(t);
  }, [extScene, rotY]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative w-full max-w-[320px] mx-auto lg:mx-0">
      <div className="absolute -inset-10 rounded-3xl bg-blue-500/14 blur-[100px]" />
      <div className="absolute -inset-16 rounded-3xl bg-violet-500/8 blur-[130px]" />

      {/* Continuous float layer */}
      <motion.div
        animate={{ y: [0, -14, 0], rotateX: [0, 2.5, 0] }}
        transition={{ duration: 5.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        style={{ transformPerspective: 1400, willChange: "transform" }}
      >
        {/* Mouse parallax + scene-change 3D rotation */}
        <motion.div style={{ x: frameX, y: frameY, rotateY: sRotY }}>
          <div className="relative rounded-[2.8rem] border-2 border-white/12 bg-[#07091a] overflow-hidden shadow-2xl shadow-black/70">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />

            <div className="flex justify-between items-center pt-11 pb-1 px-5">
              <span className="text-[10px] text-white/30 font-semibold">9:41</span>
              <span className="text-[10px] text-white/30 tracking-widest">●●●</span>
            </div>

            {extScene === undefined ? (
              <div className="flex gap-1 px-4 pt-1 pb-2">
                {SCENE_LABELS.map((label, i) => (
                  <motion.button
                    key={label}
                    type="button"
                    onClick={() => setInternalScene(i)}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full cursor-pointer"
                    animate={{
                      backgroundColor:
                        i === scene ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)",
                      color: i === scene ? "rgba(147,197,253,1)" : "rgba(255,255,255,0.22)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {label}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="pt-3" />
            )}

            <div className="px-4 pb-3" style={{ minHeight: 340 }}>
              <AnimatePresence mode="wait">
                {scene === 0 && <SceneProblema key="p" />}
                {scene === 1 && <SceneAgendamento key="a" />}
                {scene === 2 && <SceneConfirmado key="c" />}
              </AnimatePresence>
            </div>

            {extScene === undefined ? (
              <div className="px-4 pb-4">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/8">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        key={`${i}-${scene}`}
                        initial={{ scaleX: i < scene ? 1 : 0 }}
                        animate={{ scaleX: i === scene ? 1 : i < scene ? 1 : 0 }}
                        transition={{
                          duration: i === scene ? SCENE_DURATION_MS / 1000 - 0.5 : 0.25,
                          ease: i === scene ? "linear" : FILM,
                        }}
                        style={{ transformOrigin: "left" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pb-4" />
            )}

            <div className="pb-3 flex justify-center">
              <div className="w-28 h-1 bg-white/18 rounded-full" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── WordReveal ───────────────────────────────────────────────────────────────
function WordReveal({
  words,
  baseDelay = 0,
  gapDelay = 0.13,
  className,
}: {
  words: string[];
  baseDelay?: number;
  gapDelay?: number;
  className?: string;
}) {
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={word}
          initial={{ opacity: 0, y: 56, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: baseDelay + i * gapDelay, duration: 0.78, ease: FILM }}
          style={{ display: "inline-block", marginRight: "0.28em" }}
          className={className}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function Marquee() {
  const items = [...PROOF_ITEMS, ...PROOF_ITEMS];
  return (
    <div
      className="overflow-hidden py-5"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
      }}
    >
      <motion.div
        className="flex items-center w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 24, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        {items.map((item, i) => {
          const Icon = item.Icon;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: decorative marquee, order never changes
            <div key={i} className="flex items-center shrink-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-10">
                <Icon className={`h-4 w-4 text-primary${item.fill ? " fill-primary" : ""}`} />
                <span className="font-medium whitespace-nowrap">{item.text}</span>
              </div>
              <span className="text-white/15 text-base select-none">·</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ─── IntroHero ────────────────────────────────────────────────────────────────
function IntroHero() {
  const [scene, setScene] = useState(0); // 0-2 story, 3 = CTA
  const isCTA = scene >= 3;

  useEffect(() => {
    if (scene >= 3) return;
    const t = setTimeout(() => setScene((s) => s + 1), INTRO_SCENE_MS);
    return () => clearTimeout(t);
  }, [scene]);

  const bgMouseX = useMotionValue(0.5);
  const bgMouseY = useMotionValue(0.5);
  const sBgX = useSpring(bgMouseX, { stiffness: 22, damping: 20, mass: 2.2 });
  const sBgY = useSpring(bgMouseY, { stiffness: 22, damping: 20, mass: 2.2 });
  const orb1X = useTransform(sBgX, [0, 1], [-80, 80]);
  const orb1Y = useTransform(sBgY, [0, 1], [-50, 50]);
  const orb2X = useTransform(sBgX, [0, 1], [55, -55]);
  const orb2Y = useTransform(sBgY, [0, 1], [38, -38]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      bgMouseX.set(e.clientX / window.innerWidth);
      bgMouseY.set(e.clientY / window.innerHeight);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [bgMouseX, bgMouseY]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: "#050816" }} />
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 36%, rgba(5,8,22,0.65) 100%)",
        }}
      />

      {/* Scene accent glows */}
      {[
        { g: "rgba(239,68,68,0.09)", sceneIdx: 0 },
        { g: "rgba(59,130,246,0.09)", sceneIdx: 1 },
        { g: "rgba(16,185,129,0.08)", sceneIdx: 2 },
        { g: "rgba(37,99,235,0.09)", sceneIdx: 3 },
      ].map(({ g, sceneIdx }) => (
        <motion.div
          key={sceneIdx}
          className="absolute inset-0 -z-10 pointer-events-none"
          animate={{ opacity: sceneIdx === Math.min(scene, 3) ? 1 : 0 }}
          transition={{ duration: 1.4 }}
          style={{
            background: `radial-gradient(ellipse 65% 75% at 65% 35%, ${g} 0%, transparent 65%)`,
          }}
        />
      ))}

      <motion.div
        className="absolute -z-10 w-[900px] h-[900px] rounded-full bg-blue-600/11 blur-[180px] -top-72 -left-72"
        style={{ x: orb1X, y: orb1Y }}
        animate={{ scale: [1, 1.14, 1], opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: BREATH }}
      />
      <motion.div
        className="absolute -z-10 w-[700px] h-[700px] rounded-full bg-violet-600/9 blur-[150px] bottom-0 -right-40"
        style={{ x: orb2X, y: orb2Y }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 11, repeat: Number.POSITIVE_INFINITY, ease: BREATH, delay: 2.5 }}
      />
      <motion.div
        className="absolute -z-10 w-[420px] h-[420px] rounded-full bg-teal-500/5 blur-[110px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: BREATH, delay: 1.2 }}
      />

      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {PARTICLES.map((p, i) => (
          <motion.div
            // biome-ignore lint/suspicious/noArrayIndexKey: deterministic decorative particles
            key={i}
            className="absolute rounded-full bg-blue-400/25"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s }}
            animate={{ opacity: [0, 0.8, 0], y: [0, -55, -110], scale: [0, 1, 0] }}
            transition={{
              duration: p.d,
              delay: p.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 -z-10 bg-grid opacity-30" />

      {/* Story progress bars — top edge */}
      <AnimatePresence>
        {!isCTA && (
          <motion.div
            className="absolute top-0 left-0 right-0 z-20 flex gap-1.5 px-5 sm:px-10 pt-4"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {STORY.map((storyItem, i) => (
              <div
                key={storyItem.tag}
                className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/12"
              >
                <motion.div
                  className="h-full bg-white/70 rounded-full"
                  key={`${storyItem.tag}-${scene}`}
                  initial={{ scaleX: i < scene ? 1 : 0 }}
                  animate={{ scaleX: i <= scene ? 1 : 0 }}
                  transition={{
                    duration: i === scene ? INTRO_SCENE_MS / 1000 - 0.25 : 0.18,
                    ease: i === scene ? "linear" : FILM,
                  }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip button */}
      <AnimatePresence>
        {!isCTA && (
          <motion.button
            type="button"
            className="absolute top-3 right-5 sm:top-4 sm:right-10 z-20 flex items-center gap-1 text-[11px] font-medium text-white/35 hover:text-white/80 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.2 } }}
            exit={{ opacity: 0 }}
            onClick={() => setScene(3)}
          >
            Pular
            <ArrowRight className="w-3 h-3" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="relative max-w-6xl mx-auto px-4 py-28 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: story text or CTA */}
          <div>
            <AnimatePresence mode="wait">
              {!isCTA ? (
                <motion.div
                  key={`story-${scene}`}
                  initial={{ opacity: 0, y: 64, filter: "blur(20px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -48, filter: "blur(14px)" }}
                  transition={{ duration: 0.52, ease: FILM }}
                >
                  {(() => {
                    const s = STORY[scene]!;
                    return (
                      <>
                        <div
                          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold mb-8 ${s.tagCls}`}
                        >
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-current"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{
                              duration: 1.6,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: BREATH,
                            }}
                          />
                          {s.tag}
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-7">
                          {s.lines.map((line, li) => (
                            <motion.span
                              key={line}
                              className="block"
                              initial={{ opacity: 0, y: 52, filter: "blur(16px)" }}
                              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                              transition={{ delay: li * 0.11, duration: 0.62, ease: FILM }}
                            >
                              {line}
                            </motion.span>
                          ))}
                        </h1>

                        <motion.p
                          initial={{ opacity: 0, y: 22 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.55, ease: FILM }}
                          className="text-lg text-muted-foreground leading-relaxed max-w-md"
                        >
                          {s.sub}
                        </motion.p>
                      </>
                    );
                  })()}
                </motion.div>
              ) : (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: 64, filter: "blur(20px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.75, ease: FILM }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: FILM }}
                  >
                    <Badge
                      variant="secondary"
                      className="mb-6 text-xs px-3 py-1.5 border border-primary/20 bg-primary/10 text-primary"
                    >
                      <Zap className="mr-1.5 h-3 w-3" />
                      Agendamento online inteligente
                    </Badge>
                  </motion.div>

                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
                    <span className="block">
                      <WordReveal words={["Chega", "de"]} baseDelay={0.05} gapDelay={0.11} />
                      <motion.span
                        initial={{ opacity: 0, y: 56, filter: "blur(14px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ delay: 0.28, duration: 0.88, ease: FILM }}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400"
                        style={{ display: "inline-block" }}
                      >
                        WhatsApp
                      </motion.span>
                    </span>
                    <span className="block mt-1">
                      <WordReveal words={["para", "agendar"]} baseDelay={0.45} gapDelay={0.11} />
                    </span>
                  </h1>

                  <motion.p
                    initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.75, delay: 0.7, ease: FILM }}
                    className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed"
                  >
                    Agendamento online para barbearias, salões de beleza e cabelereiros. Seus
                    clientes escolhem o barbeiro, o serviço e o horário — em 3 cliques, sem te
                    chamar no WhatsApp.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.68, delay: 0.85, ease: FILM }}
                    className="flex flex-col sm:flex-row gap-3 mb-12"
                  >
                    <Link
                      href="/cadastro"
                      className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:brightness-110 hover:scale-[1.04] active:scale-95 transition-all overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-full" />
                      Começar grátis agora
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                    <Link
                      href="#como-funciona"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-medium hover:bg-white/[0.08] hover:border-white/20 transition-all"
                    >
                      Ver como funciona
                    </Link>
                  </motion.div>

                  <div className="flex flex-wrap gap-8">
                    {[
                      { value: "2 min", label: "para configurar" },
                      { value: "70%", label: "menos faltas" },
                      { value: "24/7", label: "agendamentos" },
                      { value: "grátis", label: "para começar" },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 22, scale: 0.78 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.55, delay: 1.0 + i * 0.1, ease: POP }}
                      >
                        <p className="text-2xl font-black text-primary">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 55, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease: FILM }}
            className="hidden lg:flex justify-center"
            style={{ willChange: "transform, opacity" }}
          >
            <LiveDemoMockup scene={isCTA ? undefined : scene} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── useTilt ──────────────────────────────────────────────────────────────────
function useTilt(maxAngle = 18) {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const scale = useMotionValue(1);
  const sRotX = useSpring(rotX, { stiffness: 280, damping: 32, mass: 1.1 });
  const sRotY = useSpring(rotY, { stiffness: 280, damping: 32, mass: 1.1 });
  const sScale = useSpring(scale, { stiffness: 280, damping: 32, mass: 1.1 });
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rotX.set((py - 0.5) * -maxAngle);
    rotY.set((px - 0.5) * maxAngle);
    scale.set(1.03);
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(59,130,246,0.22) 0%, rgba(139,92,246,0.09) 45%, transparent 68%)`;
      glowRef.current.style.opacity = "1";
    }
  }
  function onLeave() {
    rotX.set(0);
    rotY.set(0);
    scale.set(1);
    if (glowRef.current) glowRef.current.style.opacity = "0";
  }
  return { ref, glowRef, sRotX, sRotY, sScale, onMove, onLeave };
}

// ─── FadeUp ───────────────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 55 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: FILM }}
      style={{ willChange: "transform, opacity" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── TiltCard ─────────────────────────────────────────────────────────────────
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const { ref, glowRef, sRotX, sRotY, sScale, onMove, onLeave } = useTilt();
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: sRotX, rotateY: sRotY, scale: sScale, transformPerspective: 900 }}
      className={`relative ${className ?? ""}`}
    >
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-2xl pointer-events-none z-10 opacity-0 transition-opacity duration-500"
      />
      {children}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <IntroHero />

      {/* ══ SOCIAL PROOF ══ */}
      <div className="border-y border-white/5 bg-white/[0.02] overflow-hidden">
        <Marquee />
      </div>

      {/* ══ FEATURES ══ */}
      <section id="funcionalidades" className="py-28 max-w-6xl mx-auto px-4">
        <FadeUp className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 border border-primary/20 bg-primary/10 text-primary"
          >
            Funcionalidades
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black mb-4">Tudo que você precisa</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Do agendamento ao financeiro, o Agendaê cobre todos os aspectos do seu negócio.
          </p>
        </FadeUp>
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={featureContainerV}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            const col = i % 3;
            return (
              <motion.div key={feature.title} variants={featureCardV} custom={col}>
                <TiltCard className="h-full">
                  <div className="h-full rounded-2xl border border-white/8 bg-white/[0.03] p-6 hover:border-primary/30 hover:bg-primary/[0.04] transition-all duration-300 backdrop-blur-sm">
                    <motion.div
                      className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4"
                      whileHover={{ scale: 1.16, rotate: -6 }}
                      transition={{ type: "spring", stiffness: 380, damping: 18 }}
                    >
                      <Icon className="h-5 w-5 text-primary" />
                    </motion.div>
                    <h3 className="font-bold mb-2 text-sm">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section
        id="como-funciona"
        className="py-28 relative border-y border-white/5 overflow-hidden"
      >
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(37,99,235,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 border border-primary/20 bg-primary/10 text-primary"
            >
              Como funciona
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Configure em 4 passos</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Em menos de 2 minutos você já tem sua página de agendamento funcionando.
            </p>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                className="relative"
                custom={i}
                variants={stepContainerV}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
              >
                {i < STEPS.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute top-8 left-full h-px z-0"
                    style={{
                      background: "linear-gradient(to right, rgba(59,130,246,0.22), transparent)",
                      width: "100%",
                      transformOrigin: "left",
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.55 + i * 0.14, duration: 0.72, ease: FILM }}
                  />
                )}
                <div className="relative z-10">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-lg shadow-primary/10"
                    variants={stepCircleV}
                    whileHover={{ scale: 1.1, borderColor: "rgba(59,130,246,0.5)" }}
                  >
                    <span className="text-2xl font-black text-primary">{step.number}</span>
                  </motion.div>
                  <motion.h3 className="font-bold mb-2" variants={stepTextV}>
                    {step.title}
                  </motion.h3>
                  <motion.p
                    className="text-sm text-muted-foreground leading-relaxed"
                    variants={stepDescV}
                  >
                    {step.description}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-28 max-w-6xl mx-auto px-4">
        <FadeUp className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 border border-primary/20 bg-primary/10 text-primary"
          >
            Depoimentos
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black mb-4">Quem já usa, recomenda</h2>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              className="h-full rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm"
              style={{ transformPerspective: 1000 }}
              initial={{ opacity: 0, y: 55, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.14, duration: 0.8, ease: FILM }}
              whileHover={{
                borderColor: "rgba(255,255,255,0.14)",
                backgroundColor: "rgba(255,255,255,0.05)",
                y: -8,
                transition: { type: "spring", stiffness: 340, damping: 26 },
              }}
            >
              <div className="flex gap-0.5 mb-5">
                {[0, 1, 2, 3, 4].map((n) => (
                  <motion.div
                    key={`star-${t.name}-${n}`}
                    initial={{ opacity: 0, scale: 0.2, rotate: -25 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.16 + 0.55 + n * 0.07, duration: 0.4, ease: POP }}
                  >
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                &quot;{t.quote}&quot;
              </p>
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center shrink-0`}
                  whileHover={{ scale: 1.12 }}
                  transition={{ type: "spring", stiffness: 380, damping: 18 }}
                >
                  <span className="text-xs font-bold text-white">{t.initials}</span>
                </motion.div>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role} · {t.studio}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="precos" className="py-28 relative border-y border-white/5 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 50% 70% at 50% 50%, rgba(37,99,235,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 border border-primary/20 bg-primary/10 text-primary"
            >
              Preços
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Simples e transparente</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Comece grátis. Faça upgrade quando precisar. Sem fidelidade.
            </p>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`relative h-full rounded-2xl border p-6 flex flex-col backdrop-blur-sm ${plan.highlight ? "border-primary/40 bg-primary/[0.06] shadow-xl shadow-primary/10" : "border-white/8 bg-white/[0.03]"}`}
                initial={{ opacity: 0, y: 100, scale: 0.85 }}
                whileInView={{ opacity: 1, y: 0, scale: plan.highlight ? 1.02 : 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.12, duration: 1.0, ease: FILM }}
                whileHover={
                  plan.highlight
                    ? {
                        scale: 1.04,
                        boxShadow: "0 24px 70px rgba(59,130,246,0.22)",
                        transition: { type: "spring", stiffness: 320, damping: 26 },
                      }
                    : {
                        borderColor: "rgba(255,255,255,0.14)",
                        y: -6,
                        transition: { type: "spring", stiffness: 320, damping: 26 },
                      }
                }
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: BREATH }}
                      className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/40"
                    >
                      <Zap className="h-3 w-3" /> Mais popular
                    </motion.span>
                  </div>
                )}
                <div className="mb-6">
                  <p className="font-bold text-lg mb-0.5">{plan.name}</p>
                  <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </div>
                <motion.ul
                  className="space-y-2.5 mb-8 flex-1"
                  variants={checklistV}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {plan.features.map((feature) => (
                    <motion.li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                      variants={checkItemV}
                    >
                      <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                <Link
                  href={plan.href}
                  className={`group inline-flex items-center justify-center w-full rounded-xl py-2.5 text-sm font-semibold transition-all overflow-hidden relative ${plan.highlight ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:brightness-110 hover:scale-[1.03]" : "border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20"}`}
                >
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors duration-300 rounded-xl" />
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
          <FadeUp>
            <p className="text-center text-sm text-muted-foreground mt-8">
              Precisa de mais?{" "}
              <Link href="/precos" className="text-primary hover:underline">
                Ver planos completos
              </Link>
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-28 max-w-6xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.88, filter: "blur(24px)" }}
          whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.1, ease: FILM }}
        >
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-12 md:p-16 overflow-hidden backdrop-blur-sm">
            <div
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 120%, rgba(37,99,235,0.22) 0%, transparent 60%)",
              }}
            />
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(59,130,246,0.75), transparent)",
              }}
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: 320, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.3, ease: FILM }}
            />
            <motion.h2
              className="text-3xl md:text-5xl font-black mb-4"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.42, duration: 0.75, ease: FILM }}
            >
              Pronto para parar de
              <br />
              perder clientes?
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.58, duration: 0.68, ease: FILM }}
            >
              Crie sua conta grátis agora e tenha sua página de agendamento online em menos de 2
              minutos.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.82 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.72, duration: 0.55, ease: POP }}
            >
              <Link
                href="/cadastro"
                className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 hover:brightness-110 hover:scale-[1.04] active:scale-95 transition-all overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-full" />
                Criar conta grátis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
            <motion.p
              className="text-xs text-muted-foreground mt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              Sem cartão de crédito. Sem fidelidade. Cancele quando quiser.
            </motion.p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
