import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  ChartNoAxesCombined,
  CircleAlert,
  Eye,
  EyeOff,
  FlaskConical,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar | MARX" },
      { name: "description", content: "Tela de acesso ao ambiente de demonstração do MARX." },
    ],
  }),
  component: LoginScreen,
});

const inputStyle =
  "h-12 w-full rounded-xl border border-input bg-background/65 px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-primary";

export function LoginScreen() {
  const userRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [invalidField, setInvalidField] = useState<"user" | "password" | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "preview">("idle");

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function clearFeedback() {
    setInvalidField(null);
    setStatus((current) => (current === "preview" ? "idle" : current));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    if (!userRef.current?.value.trim()) {
      setInvalidField("user");
      userRef.current?.focus();
      return;
    }
    if (!passwordRef.current?.value.trim()) {
      setInvalidField("password");
      passwordRef.current?.focus();
      return;
    }

    setInvalidField(null);
    setShowPassword(false);
    setStatus("loading");
    // Visual preview only: no credentials are transmitted, stored or checked.
    timerRef.current = window.setTimeout(() => {
      if (passwordRef.current) passwordRef.current.value = "";
      setStatus("preview");
    }, 450);
  }

  return (
    <main lang="pt-BR" className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-[1440px] flex-col px-5 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between gap-4 border-b border-border py-5 sm:py-7">
          <div className="flex items-center gap-3" aria-label="MARX">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-red font-display text-lg font-bold shadow-red"
              aria-hidden="true"
            >
              M
            </span>
            <span className="font-display text-xl font-bold tracking-[0.14em]" aria-hidden="true">
              MARX
            </span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium text-muted-foreground">
            <FlaskConical className="size-3.5 text-primary" aria-hidden="true" />
            Ambiente de teste
          </span>
        </header>

        <div className="grid flex-1 items-center gap-8 py-9 sm:py-12 lg:grid-cols-[1.12fr_1fr] lg:gap-16">
          <section
            aria-label="Prévia do MARX"
            className="relative hidden min-h-[540px] flex-col justify-between overflow-hidden rounded-[2rem] border border-border bg-card p-9 lg:flex xl:p-12"
          >
            <div className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-primary/10 blur-[90px]" />
            <div className="relative">
              <p className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                <span className="h-px w-8 bg-primary" /> Seu painel financeiro
              </p>
              <h2 className="mt-8 max-w-[13ch] font-display text-5xl leading-[1.02] font-bold tracking-tight xl:text-6xl">
                Teus investimentos, <span className="text-primary">num só lugar.</span>
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground xl:text-base">
                Acompanha teu patrimônio, tuas posições e o desempenho da carteira.
              </p>
            </div>
            <div className="relative mt-8 overflow-hidden rounded-2xl border border-border bg-background/80 px-5 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Patrimônio simulado</p>
                  <p className="mt-1 font-display text-2xl font-bold">R$ 1.010,00</p>
                </div>
                <ChartNoAxesCombined className="size-5 text-primary" aria-hidden="true" />
              </div>
              <svg
                viewBox="0 0 360 90"
                preserveAspectRatio="none"
                className="mt-3 h-24 w-full text-primary"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="marx-preview-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="currentColor" stopOpacity=".23" />
                    <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 27H360M0 57H360M0 87H360" stroke="currentColor" strokeOpacity=".12" />
                <path
                  d="M0 76L34 66L63 70L111 50L146 56L181 37L215 42L263 21L296 26L332 9L360 14V90H0Z"
                  fill="url(#marx-preview-gradient)"
                />
                <path
                  d="M0 76L34 66L63 70L111 50L146 56L181 37L215 42L263 21L296 26L332 9L360 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </section>

          <section aria-labelledby="login-title" className="mx-auto w-full max-w-md">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-primary uppercase">
              Acesso · protótipo
            </p>
            <h1
              id="login-title"
              className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
            >
              Entra na tua conta
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
              Testa o formulário ou abre o dashboard com dados fictícios.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} method="post" noValidate>
              <div>
                <label htmlFor="login-user" className="mb-2 block text-sm font-medium">
                  Usuário
                </label>
                <input
                  ref={userRef}
                  id="login-user"
                  className={inputStyle}
                  placeholder="Ex.: test"
                  autoComplete="off"
                  required
                  disabled={status === "loading"}
                  aria-invalid={invalidField === "user"}
                  aria-describedby={invalidField === "user" ? "login-error" : undefined}
                  onChange={clearFeedback}
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-2 block text-sm font-medium">
                  Senha
                </label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className={inputStyle + " pr-14"}
                    placeholder="Usa uma senha fictícia"
                    autoComplete="off"
                    required
                    disabled={status === "loading"}
                    aria-invalid={invalidField === "password"}
                    aria-describedby={invalidField === "password" ? "login-error" : undefined}
                    onChange={clearFeedback}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    disabled={status === "loading"}
                    onClick={() => setShowPassword((shown) => !shown)}
                    className="absolute inset-y-0 right-1 my-1 grid w-10 place-items-center rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {invalidField && (
                <p
                  id="login-error"
                  role="alert"
                  className="flex items-center gap-2 text-sm text-primary"
                >
                  <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                  {invalidField === "user" ? "Preenche o usuário." : "Preenche a senha."}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-red px-4 text-sm font-bold text-primary-foreground shadow-red transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:opacity-70"
              >
                {status === "loading" ? (
                  <>
                    <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" />{" "}
                    Validando…
                  </>
                ) : (
                  <>
                    Entrar <ArrowRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </button>
              <div role="status" aria-live="polite">
                {status === "preview" && (
                  <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground">
                    Campos preenchidos. O login real ainda não está conectado ao banco.
                  </p>
                )}
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-sm text-sm font-bold text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                Abrir dashboard demo <ArrowDownRight className="size-4" aria-hidden="true" />
              </a>
              <span className="text-xs text-muted-foreground">Sem enviar dados</span>
            </div>
          </section>
        </div>

        <footer className="border-t border-border py-5 text-xs text-muted-foreground">
          MARX · Protótipo de acesso. Não uses credenciais reais.
        </footer>
      </div>
    </main>
  );
}
