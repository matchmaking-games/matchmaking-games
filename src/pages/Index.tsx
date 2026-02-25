import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, X, AlertTriangle, Loader2, User, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import DisplayCards from "@/components/ui/display-cards";
import { SocialIcon } from "@/components/SocialIcon";
import { supabase } from "@/integrations/supabase/client";
import matchmakingLogo from "@/assets/matchmaking-logo.png";

/* ─── pattern helpers (inline, no new components) ─── */
const gridPattern = {
  backgroundImage:
    "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};
const dotsPattern = {
  backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
};
const fadeRadial = {
  maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
  WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
};
const fadeHorizontal = {
  maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
  WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
};

/* ─── framer variants ─── */
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── social links ─── */
const socials = [
  { network: "linkedin", href: "https://www.linkedin.com/company/matchmaking-games/" },
  { network: "instagram", href: "https://www.instagram.com/matchmaking.games/" },
  { network: "tiktok", href: "https://www.tiktok.com/@matchmaking.games" },
  { network: "youtube", href: "https://www.youtube.com/@Negócios-em-Jogo" },
  { network: "linktree", href: "https://linktr.ee/matchmaking.games" },
];

/* ═══════════════════════════════════════════════════════════════ */

const Index = () => {
  const [username, setUsername] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const validateUsername = (value: string): string => {
    if (value.length === 0) return "";
    if (value.length < 3) return "Mínimo 3 caracteres";
    if (value.length > 30) return "Máximo 30 caracteres";
    if (!/^[a-z0-9-]+$/.test(value)) return "Use apenas letras, números e hífen";
    if (value.startsWith("-") || value.endsWith("-")) return "Não pode começar ou terminar com hífen";
    return "";
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsername(value);
    setValidationError(validateUsername(value));
    setIsAvailable(null);
  };

  useEffect(() => {
    if (!username || validationError) {
      setIsAvailable(null);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc('check_slug_availability', {
        slug_to_check: username
      });

      if (error) {
        console.error('Error checking slug availability:', error);
        setIsAvailable(false);
      } else {
        setIsAvailable(data);
      }
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username, validationError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || validationError || isChecking || !isAvailable) {
      return;
    }
    navigate(`/signup?slug=${username}`);
  };

  const renderStatusIcon = () => {
    if (!username || username.length < 3) return null;
    if (validationError) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    if (isChecking) return <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />;
    if (isAvailable === true) return <Check className="w-4 h-4 text-green-500" />;
    if (isAvailable === false) return <X className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getStatusMessage = () => {
    if (!username) return { text: "Reserve seu username antes que seja tarde!", className: "text-muted-foreground" };
    if (validationError) return { text: validationError, className: "text-destructive" };
    if (isChecking) return { text: "Reserve seu username antes que seja tarde!", className: "text-muted-foreground" };
    if (isAvailable === true) return { text: "Boa escolha! Esse username está livre.", className: "text-green-500" };
    if (isAvailable === false) return { text: "Ops, esse username já foi pego. Tente outro.", className: "text-destructive" };
    return { text: "Reserve seu username antes que seja tarde!", className: "text-muted-foreground" };
  };

  const isButtonDisabled = !username || !!validationError || isChecking || isAvailable !== true;

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div style={{ background: "#0f0f0f", color: "#f0f0f0" }} className="min-h-screen overflow-x-hidden">

      {/* ────────── SEÇÃO 1 — HERO ────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ padding: "80px 24px" }}>
        {/* grid bg */}
        <div className="absolute inset-0 z-0" style={{ ...gridPattern, ...fadeRadial }} />

        <div className="relative z-10 text-center w-full" style={{ maxWidth: 640 }}>
          {/* logo */}
          <motion.img
            src={matchmakingLogo}
            alt="Matchmaking"
            className="h-8 mx-auto mb-12"
            style={{ opacity: 0.6 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.4 }}
          />

          {/* badge */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid rgba(34,228,122,0.20)",
                background: "rgba(34,228,122,0.08)",
                borderRadius: 9999,
                padding: "4px 14px",
                fontSize: 12,
                color: "#22e47a",
                fontWeight: 500,
                marginBottom: 20,
              }}
            >
              ◆ O portal de games do Brasil
            </span>
          </motion.div>

          {/* headline */}
          <motion.h1
            className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span style={{ color: "#f0f0f0" }}>Seu lugar na</span>
            <br />
            <span style={{ color: "#22e47a" }}>indústria de games</span>
          </motion.h1>

          {/* subline */}
          <motion.p
            className="text-lg mx-auto mb-8"
            style={{ color: "rgba(255,255,255,0.55)", maxWidth: 480 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Portfólio, vagas e conexões — tudo em um lugar feito para quem vive de games.
          </motion.p>

          {/* slug input */}
          <motion.form
            id="hero-input"
            onSubmit={handleSubmit}
            className="mx-auto w-full"
            style={{ maxWidth: 480 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div
              className="focus-within:border-[rgba(34,228,122,0.40)] transition-colors duration-200"
              style={{
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 12,
                height: 56,
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <span
                className="font-mono text-sm whitespace-nowrap flex-shrink-0"
                style={{ color: "rgba(255,255,255,0.30)", paddingLeft: 16, paddingRight: 4 }}
              >
                matchmaking.games/p/
              </span>
              <Input
                type="text"
                placeholder="seu-username"
                value={username}
                onChange={handleUsernameChange}
                maxLength={30}
                className="bg-transparent border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-sm placeholder:text-white/25 h-full px-0"
                style={{ color: "#f0f0f0" }}
              />
              <div className="px-2 flex-shrink-0">{renderStatusIcon()}</div>
              <button
                type="submit"
                disabled={isButtonDisabled}
                className="flex-shrink-0 flex items-center justify-center transition-[filter] duration-200 hover:brightness-[1.15] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "#22e47a",
                  color: "black",
                  borderRadius: 8,
                  height: 40,
                  width: 40,
                  margin: 8,
                  border: "none",
                  cursor: isButtonDisabled ? "not-allowed" : "pointer",
                }}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* status */}
            <p className={`text-xs mt-2 text-center min-h-[20px] ${getStatusMessage().className}`}>
              {getStatusMessage().text}
            </p>
          </motion.form>

          {/* login link */}
          <motion.p
            className="text-sm mt-4"
            style={{ color: "rgba(255,255,255,0.40)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            Já tem conta?{" "}
            <Link to="/login" style={{ color: "#22e47a" }} className="hover:underline font-medium">
              Entrar
            </Link>
          </motion.p>
        </div>
      </section>

      {/* ────────── SEÇÃO 2 — SOCIAL PROOF STRIP ────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.015)",
          padding: "32px 24px",
        }}
      >
        <div className="absolute inset-0 z-0" style={{ ...dotsPattern, ...fadeHorizontal, opacity: 0.5 }} />

        <motion.div
          className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mx-auto"
          style={{ maxWidth: 700 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <img
            src="https://njyoimhjfqtygnlccjzq.supabase.co/storage/v1/object/public/public-images/532180900_17851812207521685_1627174041059843704_n.jpg"
            alt="Matchmaking em evento de games"
            loading="lazy"
            style={{
              maxWidth: 180,
              width: "100%",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.10)",
              flexShrink: 0,
            }}
          />
          <div style={{ maxWidth: 320 }} className="text-center md:text-left">
            <p className="font-display font-semibold" style={{ fontSize: 18, color: "#f0f0f0" }}>
              Presente nos maiores eventos de games do Brasil
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.50)", marginTop: 8 }}>
              Parceira oficial do Games Dev Hub — conectando profissionais e estúdios em eventos reais pelo país.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ────────── SEÇÃO 3 — PARA QUEM É ────────── */}
      <section className="relative overflow-hidden py-16 md:py-24 px-5 md:px-6">
        <div className="absolute inset-0 z-0" style={{ ...gridPattern, ...fadeRadial }} />

        <div className="relative z-10">
          {/* header */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 12 }}>
              PARA QUEM É
            </p>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-12" style={{ color: "#f0f0f0" }}>
              Dois lados. Uma conexão.
            </h2>
          </motion.div>

          {/* 2 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mx-auto mb-16" style={{ maxWidth: 900 }}>
            {/* card profissionais */}
            <motion.div
              className="transition-colors duration-300"
              style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 32 }}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,228,122,0.20)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
              <div style={{ width: 40, height: 40, background: "rgba(34,228,122,0.10)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <User size={18} color="#22e47a" />
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "#22e47a", marginBottom: 8 }}>Para profissionais</p>
              <p className="font-display font-semibold" style={{ fontSize: 20, color: "#f0f0f0", lineHeight: 1.3, marginBottom: 20 }}>
                Mostre seu trabalho para quem decide
              </p>
              {["Portfólio público com todos os seus projetos", "Visibilidade direta para estúdios que estão contratando", "Candidatura com um clique, sem enviar currículo"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                  <Check size={14} color="#22e47a" className="flex-shrink-0" style={{ marginTop: 2 }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.60)" }}>{t}</span>
                </div>
              ))}
              <span style={{ display: "inline-flex", marginTop: 24, border: "1px solid rgba(34,228,122,0.25)", borderRadius: 9999, padding: "4px 14px", fontSize: 12, color: "#22e47a", fontWeight: 500 }}>
                Sempre gratuito para profissionais
              </span>
            </motion.div>

            {/* card estúdios */}
            <motion.div
              className="transition-colors duration-300"
              style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 32 }}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
              <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.06)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Building2 size={18} color="rgba(255,255,255,0.60)" />
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>Para estúdios</p>
              <p className="font-display font-semibold" style={{ fontSize: 20, color: "#f0f0f0", lineHeight: 1.3, marginBottom: 20 }}>
                Encontre o talento antes da concorrência
              </p>
              {["Portfólios completos antes de entrar em contato", "Publique sua primeira vaga gratuitamente", "Destaque sua vaga por R$ 199 e alcance mais candidatos"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                  <Check size={14} color="rgba(255,255,255,0.40)" className="flex-shrink-0" style={{ marginTop: 2 }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.60)" }}>{t}</span>
                </div>
              ))}
              <span style={{ display: "inline-flex", marginTop: 24, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9999, padding: "4px 14px", fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
                Comece grátis, sem cartão
              </span>
            </motion.div>
          </div>

          {/* DisplayCards */}
          <motion.div
            className="mx-auto"
            style={{ maxWidth: 600 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-center mb-8" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
              Veja como ficam os portfólios na plataforma
            </p>
            <DisplayCards />
          </motion.div>
        </div>
      </section>

      {/* ────────── SEÇÃO 4 — COMO FUNCIONA ────────── */}
      <section className="relative overflow-hidden py-16 md:py-24 px-5 md:px-6">
        <div className="absolute inset-0 z-0" style={{ ...dotsPattern, ...fadeRadial }} />

        <div className="relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 12 }}>
              O CAMINHO
            </p>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-16" style={{ color: "#f0f0f0" }}>
              Três passos. Uma carreira.
            </h2>
          </motion.div>

          <motion.div
            className="relative grid grid-cols-1 md:grid-cols-3 gap-10 mx-auto"
            style={{ maxWidth: 860 }}
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {/* dashed line */}
            <div
              className="hidden md:block absolute"
              style={{ top: 20, left: "calc(16.66% + 24px)", right: "calc(16.66% + 24px)", height: 1, borderTop: "1px dashed rgba(255,255,255,0.10)", zIndex: 0 }}
            />

            {[
              { n: "01", title: "Reserve seu username", desc: "Escolha sua URL pública: matchmaking.games/p/seu-nome. É sua identidade permanente na indústria." },
              { n: "02", title: "Monte seu portfólio", desc: "Adicione projetos, skills e experiências. Tudo em um lugar que estúdios vão encontrar." },
              { n: "03", title: "Seja descoberto", desc: "Estúdios buscam talentos ativamente na plataforma. Seu perfil aparece para quem está contratando agora." },
            ].map((s) => (
              <motion.div key={s.n} variants={staggerItem} className="relative z-[1] text-left md:text-center">
                <span className="font-display font-bold block mb-4" style={{ fontSize: 13, color: "#22e47a" }}>{s.n}</span>
                <p className="font-display font-semibold mb-2" style={{ fontSize: 20, color: "#f0f0f0" }}>{s.title}</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.50)", lineHeight: 1.6 }}>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────── SEÇÃO 5 — FAQ ────────── */}
      <section className="relative overflow-hidden py-16 md:py-24 px-5 md:px-6">
        <div className="absolute inset-0 z-0" style={{ ...gridPattern, ...fadeHorizontal }} />

        <motion.div
          className="relative z-10 mx-auto"
          style={{ maxWidth: 640 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 12 }}>
            DÚVIDAS
          </p>
          <h2 className="font-display font-bold text-4xl mb-10" style={{ color: "#f0f0f0" }}>
            Perguntas frequentes.
          </h2>

          <Accordion type="single" collapsible className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {[
              { q: "O que é a Matchmaking?", a: "Matchmaking é o portal de empregos feito sob demanda para as necessidades do mercado nacional, com a intenção de conectar estúdios e candidatos." },
              { q: "Sou profissional, como acho as vagas?", a: "Para encontrar uma vaga, basta ir para a página de busca e aplicar os filtros que combinem com seu perfil." },
              { q: "Sou estúdio, como faço para publicar uma vaga?", a: "Basta criar sua conta, preencher o formulário com as necessidades da sua vaga e escolher o plano, inclusive sendo possível publicar de graça." },
            ].map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-b-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                <AccordionTrigger
                  className="font-display font-medium text-left hover:no-underline py-5 data-[state=open]:text-[#22e47a]"
                  style={{ fontSize: 16, color: "#f0f0f0" }}
                >
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, paddingBottom: 20 }}>
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      {/* ────────── SEÇÃO 6 — CTA FINAL ────────── */}
      <section
        className="relative overflow-hidden text-center"
        style={{
          padding: "96px 24px",
          background: "rgba(34,228,122,0.04)",
          borderTop: "1px solid rgba(34,228,122,0.10)",
          borderBottom: "1px solid rgba(34,228,122,0.10)",
        }}
      >
        <div className="absolute inset-0 z-0" style={{ ...dotsPattern, ...fadeRadial, opacity: 0.4 }} />

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl mx-auto mb-8" style={{ color: "#f0f0f0", maxWidth: 480 }}>
            Sua carreira em games começa com um username.
          </h2>
          <button
            onClick={() => document.getElementById("hero-input")?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className="transition-[filter] duration-200 hover:brightness-[1.12]"
            style={{
              background: "#22e47a",
              color: "black",
              fontWeight: 600,
              fontSize: 15,
              padding: "12px 32px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
            }}
          >
            Reservar meu username
          </button>
        </motion.div>
      </section>

      {/* ────────── FOOTER ────────── */}
      <footer
        className="flex flex-col md:flex-row items-center md:justify-between gap-5"
        style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px" }}
      >
        <img src={matchmakingLogo} alt="Matchmaking" className="h-6" style={{ opacity: 0.55 }} />

        <div className="flex items-center gap-5">
          {socials.map((s) => (
            <a
              key={s.network}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}
            >
              <SocialIcon network={s.network} size={18} className="fill-current" />
            </a>
          ))}
        </div>

        <p className="w-full text-center mt-6 md:mt-0 md:absolute md:bottom-3 md:left-0 md:right-0" style={{ fontSize: 12, color: "rgba(255,255,255,0.20)" }}>
          © 2025 Matchmaking · Feito para quem vive de games
        </p>
      </footer>
    </div>
  );
};

export default Index;
