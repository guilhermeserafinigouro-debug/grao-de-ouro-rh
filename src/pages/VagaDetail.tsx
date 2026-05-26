import { useParams, Link } from "react-router-dom";
import { empresas } from "@/data/vagas";
import { useVagas } from "@/hooks/useSanity";
import { useState, useMemo } from "react";
import {
  ArrowLeft, MapPin, Building2, Send, User,
  FileText, Link as LinkIcon, DollarSign, Map as MapIcon,
  AlertCircle, CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

// --- FIELD COMPONENT ---
const Field = ({
  label, icon: Icon, name, type = "text", placeholder,
  isTextArea = false, value, onChange, onBlur, error, touched, brandColor, optional,
}: any) => {
  const hasError = touched && error;
  const isSuccess = touched && !error && value.length > 0;

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!hasError) {
      e.currentTarget.style.borderColor = brandColor;
      e.currentTarget.style.boxShadow = `0 0 0 3px ${brandColor}25`;
    }
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "";
    e.currentTarget.style.boxShadow = "";
    onBlur(e);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {label}{" "}
        {optional && (
          <span className="text-slate-300 font-normal normal-case">(Opcional)</span>
        )}
      </label>
      <div className="relative">
        {!isTextArea && Icon && (
          <Icon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10"
          />
        )}

        {isTextArea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            onBlur={blurStyle}
            onFocus={focusStyle}
            placeholder={placeholder}
            rows={3}
            className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-sm transition-all resize-none outline-none placeholder:text-slate-300 ${
              hasError
                ? "border-red-400 ring-2 ring-red-400/10"
                : "border-slate-200 focus:bg-white"
            }`}
          />
        ) : (
          <input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={blurStyle}
            onFocus={focusStyle}
            placeholder={placeholder}
            className={`w-full ${Icon ? "pl-9" : "px-4"} pr-9 py-2.5 rounded-xl bg-slate-50 border text-sm transition-all outline-none placeholder:text-slate-300 ${
              hasError
                ? "border-red-400 ring-2 ring-red-400/10"
                : "border-slate-200 focus:bg-white"
            }`}
          />
        )}

        <div
          className={`absolute right-3 flex gap-1.5 ${
            isTextArea ? "top-2.5" : "top-1/2 -translate-y-1/2"
          }`}
        >
          <AnimatePresence mode="wait">
            {hasError && (
              <motion.div
                key="err"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <AlertCircle className="text-red-400" size={15} />
              </motion.div>
            )}
            {isSuccess && (
              <motion.div
                key="ok"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <CheckCircle2 className="text-green-500" size={15} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-red-500 text-xs"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN PAGE ---
const VagaDetail = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const { data: vagas = [], isLoading } = useVagas();

  const vaga = vagas.find((v) => v.slug === slug);
  const empresa = empresas.find((e) => e.nome === vaga?.empresa);
  const brandColor = empresa?.corPrincipal || "#f7a824";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    nome: "", email: "", whatsapp: "", linkedin: "",
    cidade: "", pretensao: "", resumo: "", area: vaga?.categoria || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isDark = useMemo(() => {
    const hex = brandColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 155;
  }, [brandColor]);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#f7a824] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!vaga || !empresa) return null;

  const maskPhone = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);

  const maskCurrency = (value: string) => {
    const onlyDigits = value.replace(/\D/g, "");
    if (!onlyDigits) return "";
    return (Number(onlyDigits) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === "whatsapp") finalValue = maskPhone(value);
    if (name === "pretensao") finalValue = maskCurrency(value);
    setForm((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    let error = "";
    if (name === "nome" && value.trim().length < 3) error = "Nome muito curto.";
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      error = "E-mail inválido.";
    if (name === "whatsapp" && value.length < 15) error = "WhatsApp incompleto.";
    if (name === "cidade" && value.trim().length < 3) error = "Informe sua cidade.";
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const FLW_BASE_URL = "https://api.flw.chat/chat/v1/channel/wa/5563999182402";
  const RESUMO_MAX_LENGTH = 500;

  const PORTAL_WEBHOOK_URL =
    "https://n8n.srv894982.hstgr.cloud/webhook/aa42d93a-eff4-436a-992b-c773e0b01263";
  const PORTAL_WEBHOOK_AUTH = "Basic " + btoa("portal-vagas:bb6ba615-6991-47d2-bcb9-307a757df200");

  const formatWhatsappE164 = (masked: string) => {
    const digits = masked.replace(/\D/g, "");
    return digits ? `+55|${digits}` : "";
  };

  const formatSalaryExpectation = (masked: string) => {
    if (!masked) return "";
    return masked.replace(/[^\d,]/g, "").replace(/^,+/, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasErrors = Object.values(errors).some((err) => err !== "");
    const hasRequiredEmpty =
      !form.nome || !form.email || !form.whatsapp || !form.cidade;

    if (hasErrors || hasRequiredEmpty) {
      setTouched({ nome: true, email: true, whatsapp: true, cidade: true });
      toast({
        variant: "destructive",
        title: "Ops!",
        description: "Preencha os campos obrigatórios.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        source: "portal_vagas",
        eventType: "JOB_APPLICATION_CREATED",
        sentAt: new Date().toISOString(),
        job: {
          uuid: vaga.uuid || null,
          slug: vaga.slug,
          title: vaga.titulo,
          company: vaga.empresa,
          location: vaga.localizacao,
        },
        candidate: {
          fullName: form.nome,
          email: form.email,
          whatsapp: formatWhatsappE164(form.whatsapp),
          city: form.cidade,
          linkedinOrPortfolio: form.linkedin || "",
          salaryExpectation: formatSalaryExpectation(form.pretensao),
          professionalSummary: form.resumo || "",
        },
      };

      console.log("[Webhook] URL:", PORTAL_WEBHOOK_URL);
      console.log("[Webhook] Payload:", payload);

      fetch(PORTAL_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: PORTAL_WEBHOOK_AUTH,
        },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const bodyText = await res.text().catch(() => "");
          if (res.ok) {
            console.log(
              `%c[Webhook] ✅ Sucesso ${res.status} ${res.statusText}`,
              "color: green; font-weight: bold;",
              bodyText
            );
          } else {
            console.error(
              `[Webhook] ❌ Falha HTTP ${res.status} ${res.statusText}`,
              bodyText
            );
          }
        })
        .catch((err) => {
          console.error("[Webhook] ❌ Erro de rede/CORS:", err);
        });

      const mensagem =
        `Nova Candidatura\n\n` +
        `Vaga: ${vaga.titulo}\n` +
        `Empresa: ${vaga.empresa}\n\n` +
        `Nome: ${form.nome}\n` +
        `E-mail: ${form.email}\n` +
        `Cidade: ${form.cidade}\n` +
        `WhatsApp: ${form.whatsapp}\n` +
        `LinkedIn: ${form.linkedin || "Não informado"}\n` +
        `Pretensão: ${form.pretensao || "Não informado"}\n\n` +
        `Resumo: ${form.resumo || "Não informado"}`;

      const currentParams = new URLSearchParams(window.location.search);
      const params = new URLSearchParams();

      params.set("text", mensagem);

      ["utm_source", "utm_campaign", "utm_content", "utm_medium"].forEach((key) => {
        const val = currentParams.get(key);
        if (val) params.set(key, val);
      });

      if (vaga.uuid) {
        params.set("utm_term", vaga.uuid);
      }

      const finalUrl = `${FLW_BASE_URL}?${params.toString()}`;
      window.open(finalUrl, "_blank");
      toast({ title: "Sucesso!", description: "Redirecionando para o WhatsApp..." });
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao processar.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] relative flex flex-col">
      {/* Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${empresa.bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.07,
        }}
      />

      {/* Nav */}
      <div
        className="fixed top-0 left-0 right-0 z-[100] h-14 flex items-center border-b border-white/10 backdrop-blur-xl"
        style={{ backgroundColor: `${brandColor}CC` }}
      >
        <div className="container mx-auto px-4">
          <Link
            to="/#vagas"
            className={`inline-flex items-center gap-2 font-semibold text-sm transition-all hover:opacity-80 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            <div
              className={`p-1 rounded-full border ${
                isDark
                  ? "border-white/30 bg-white/10"
                  : "border-slate-900/20 bg-black/5"
              }`}
            >
              <ArrowLeft size={14} />
            </div>
            Voltar às vagas
          </Link>
        </div>
      </div>

      {/* Main — two-column layout on desktop */}
      <main className="relative z-10 pt-14 flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6 lg:flex lg:gap-6 lg:items-start">

          {/* ===== LEFT PANEL: Job Info (sticky on desktop) ===== */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:w-[360px] lg:shrink-0 lg:sticky lg:top-20 mb-5 lg:mb-0"
          >
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200/60">
              {/* Job header */}
              <div
                className="px-6 py-6 text-center relative overflow-hidden"
                style={{ backgroundColor: brandColor }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
                <h1
                  className={`text-xl font-bold mb-2 tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {vaga.titulo}
                </h1>
                <div
                  className={`flex flex-wrap justify-center gap-3 text-xs font-medium ${
                    isDark ? "text-white/75" : "text-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {vaga.localizacao}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 size={12} /> {vaga.empresa}
                  </span>
                </div>
              </div>

              {/* Description + Requirements */}
              <div className="bg-white p-5 space-y-5">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span
                      className="w-0.5 h-3.5 rounded-full inline-block"
                      style={{ backgroundColor: brandColor }}
                    />
                    Descrição
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {vaga.descricaoCompleta}
                  </p>
                </div>

                {vaga.requisitos && vaga.requisitos.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <span
                        className="w-0.5 h-3.5 rounded-full inline-block"
                        style={{ backgroundColor: brandColor }}
                      />
                      Requisitos
                    </h3>
                    <ul className="space-y-1.5">
                      {vaga.requisitos.map((req: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <div
                            className="w-1 h-1 rounded-full mt-2 shrink-0"
                            style={{ backgroundColor: brandColor }}
                          />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {vaga.beneficios && vaga.beneficios.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <span
                        className="w-0.5 h-3.5 rounded-full inline-block"
                        style={{ backgroundColor: brandColor }}
                      />
                      Benefícios
                    </h3>
                    <ul className="space-y-1.5">
                      {vaga.beneficios.map((ben: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <div
                            className="w-1 h-1 rounded-full mt-2 shrink-0"
                            style={{ backgroundColor: brandColor }}
                          />
                          {ben}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ===== RIGHT PANEL: Application Form ===== */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="flex-1 min-w-0"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
              {/* Form header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <div
                  className="p-1.5 rounded-lg shrink-0"
                  style={{ backgroundColor: `${brandColor}18` }}
                >
                  <User size={15} style={{ color: brandColor }} />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-800">
                    Dados da Candidatura
                  </h2>
                  <p className="text-xs text-slate-400">
                    Campos com * são obrigatórios
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Nome Completo *"
                    name="nome"
                    icon={User}
                    placeholder="Seu nome"
                    value={form.nome}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.nome}
                    touched={touched.nome}
                    brandColor={brandColor}
                  />
                  <Field
                    label="E-mail *"
                    name="email"
                    type="email"
                    icon={FileText}
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.email}
                    touched={touched.email}
                    brandColor={brandColor}
                  />
                  <Field
                    label="WhatsApp *"
                    name="whatsapp"
                    icon={Send}
                    placeholder="(00) 00000-0000"
                    value={form.whatsapp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.whatsapp}
                    touched={touched.whatsapp}
                    brandColor={brandColor}
                  />
                  <Field
                    label="Cidade/UF *"
                    name="cidade"
                    icon={MapIcon}
                    placeholder="Ex: Alfenas/MG"
                    value={form.cidade}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.cidade}
                    touched={touched.cidade}
                    brandColor={brandColor}
                  />
                  <Field
                    label="LinkedIn / Portfólio"
                    name="linkedin"
                    icon={LinkIcon}
                    placeholder="https://..."
                    optional
                    value={form.linkedin}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.linkedin}
                    touched={touched.linkedin}
                    brandColor={brandColor}
                  />
                  <Field
                    label="Pretensão Salarial"
                    name="pretensao"
                    icon={DollarSign}
                    placeholder="R$ 0,00"
                    optional
                    value={form.pretensao}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.pretensao}
                    touched={touched.pretensao}
                    brandColor={brandColor}
                  />
                </div>

                <div>
                  <Field
                    label="Resumo Profissional"
                    name="resumo"
                    isTextArea
                    placeholder="Conte brevemente sobre você, experiências e objetivos..."
                    optional
                    value={form.resumo}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      if (e.target.value.length <= RESUMO_MAX_LENGTH) handleChange(e);
                    }}
                    onBlur={handleBlur}
                    error={errors.resumo}
                    touched={touched.resumo}
                    brandColor={brandColor}
                  />
                  <p className="text-xs text-slate-400 text-right mt-1">
                    {form.resumo.length}/{RESUMO_MAX_LENGTH}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 hover:brightness-105"
                  style={{
                    backgroundColor: brandColor,
                    color: isDark ? "#fff" : "#0f172a",
                  }}
                >
                  {isSubmitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      Enviar via WhatsApp
                      <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer brandColor={brandColor} showLogo={false} />
    </div>
  );
};

export default VagaDetail;
