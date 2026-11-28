import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, PieChart, Pie, Cell } from "recharts";
import { Bell, Eye, EyeOff, Home, PieChart as PieIcon, ArrowLeftRight, User, TrendingUp, TrendingDown, Link2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MARX — Dashboard de rentabilidade" },
      { name: "description", content: "Veja a rentabilidade de todos os seus investimentos via Open Finance." },
      { property: "og:title", content: "MARX — Dashboard de rentabilidade" },
      { property: "og:description", content: "Transparência total dos seus investimentos via Open Finance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Range = "1M" | "6M" | "1A" | "Tudo";
const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const series: Record<Range, { m: string; v: number }[]> = {
  "1M": Array.from({ length: 30 }, (_, i) => ({ m: `${i + 1}`, v: 182000 + i * 160 + Math.sin(i / 2) * 900 })),
  "6M": months.slice(5, 11).map((m, i) => ({ m, v: 168000 + i * 3100 + (i % 2 ? -1200 : 800) })),
  "1A": months.map((m, i) => ({ m, v: 150000 + i * 2900 + Math.sin(i) * 2500 })),
  Tudo: ["2021","2022","2023","2024","2025","2026"].map((m, i) => ({ m, v: 60000 + i * 25000 + i * i * 1000 })),
};

const banks = [
  { name: "XP Investimentos", short: "XP", value: 98420.5, ret: 14.8, color: "var(--chart-2)" },
  { name: "Nubank", short: "Nu", value: 52310.9, ret: 11.2, color: "var(--chart-1)" },
  { name: "Mercado Pago", short: "MP", value: 36780.2, ret: 10.4, color: "var(--chart-3)" },
];
const classes = [
  { name: "CDB", value: 64200, ret: 12.1, color: "var(--chart-1)" },
  { name: "Ações", value: 48900, ret: 18.6, color: "var(--chart-2)" },
  { name: "Cripto", value: 22400, ret: -4.3, color: "var(--chart-3)" },
  { name: "Tesouro", value: 31800, ret: 10.9, color: "var(--chart-4)" },
  { name: "FIIs", value: 20211.6, ret: 8.7, color: "var(--chart-5)" },
];
const assets: Record<string, { n: string; b: string; v: number; r: number }[]> = {
  CDB: [{ n: "CDB 110% CDI", b: "XP", v: 30000, r: 12.8 }, { n: "Caixinha Nubank", b: "Nu", v: 18200, r: 11.4 }, { n: "CDB Mercado Pago 105%", b: "MP", v: 16000, r: 11.9 }],
  Ações: [{ n: "PETR4", b: "XP", v: 18400, r: 24.1 }, { n: "ITUB4", b: "XP", v: 15500, r: 16.2 }, { n: "WEGE3", b: "Nu", v: 15000, r: 13.8 }],
  Cripto: [{ n: "Bitcoin", b: "MP", v: 14200, r: 6.2 }, { n: "Ethereum", b: "Nu", v: 8200, r: -18.4 }],
  Tesouro: [{ n: "Tesouro IPCA+ 2035", b: "XP", v: 21800, r: 11.3 }, { n: "Tesouro Selic", b: "Nu", v: 10000, r: 10.1 }],
  FIIs: [{ n: "HGLG11", b: "XP", v: 12211.6, r: 9.4 }, { n: "MXRF11", b: "MP", v: 8000, r: 7.6 }],
};

const notifications = ["Seu CDB XP rendeu R$ 312,40 este mês", "PETR4 subiu 3,2% hoje", "Nova conta Mercado Pago sincronizada"];
const transactions = [
  { desc: "Aporte CDB 110% CDI", bank: "XP", type: "Aportes", date: "20/11", v: 5000 },
  { desc: "Rendimento Caixinha", bank: "Nubank", type: "Rendimentos", date: "18/11", v: 182.3 },
  { desc: "Resgate Bitcoin", bank: "Mercado Pago", type: "Resgates", date: "15/11", v: -1200 },
  { desc: "Dividendos ITUB4", bank: "XP", type: "Rendimentos", date: "12/11", v: 96.5 },
  { desc: "Aporte Tesouro Selic", bank: "Nubank", type: "Aportes", date: "05/11", v: 2000 },
  { desc: "Resgate CDB MP", bank: "Mercado Pago", type: "Resgates", date: "01/11", v: -800 },
];

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function useCountUp(target: number, ms = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / ms); setV(target * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function Index() {
  const [range, setRange] = useState<Range>("1A");
  const [hide, setHide] = useState(false);
  const [bank, setBank] = useState<string | null>(null);
  const [cls, setCls] = useState("CDB");
  const [tab, setTab] = useState(0);
  const [notif, setNotif] = useState(false);
  const [readAll, setReadAll] = useState(false);
  const [txFilter, setTxFilter] = useState("Todas");
  const total = banks.reduce((a, b) => a + b.value, 0);
  const selectedBank = banks.find((b) => b.short === bank);
  const shown = useCountUp(selectedBank?.value ?? total);
  const data = useMemo(() => {
    const f = selectedBank ? selectedBank.value / total : 1;
    return series[range].map((d) => ({ ...d, v: d.v * f }));
  }, [range, selectedBank, total]);
  const first = data[0]?.v ?? 1, last = data[data.length - 1]?.v ?? 1;
  const pct = ((last - first) / first) * 100;
  const mask = (s: string) => (hide ? "••••••" : s);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-8 md:pl-44 xl:pl-60">
      <aside className="fixed inset-y-0 left-0 hidden w-44 flex-col border-r border-border bg-card px-4 py-8 md:flex xl:w-60 xl:px-6">
        <div className="flex items-center gap-2 px-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-red font-display font-bold shadow-red">M</div>
          <span className="font-display text-2xl font-bold">MARX</span>
        </div>
        <nav aria-label="Menu principal" className="mt-12 space-y-2">
          {[Home, PieIcon, ArrowLeftRight, User].map((Icon, i) => (
            <Button variant="ghost" key={i} onClick={() => setTab(i)} aria-current={tab === i ? "page" : undefined}
              className={`h-12 w-full justify-start gap-3 px-3 ${tab === i ? "bg-primary/15 text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <Icon size={20} /><span>{["Início", "Carteira", "Transações", "Perfil"][i]}</span>
            </Button>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2 border-t border-border px-2 pt-6 text-xs text-muted-foreground"><Link2 size={16} className="shrink-0" />Open Finance</div>
      </aside>
      <div className="mx-auto max-w-md px-5 pt-6 md:max-w-[1440px] md:px-7 md:pt-8 xl:px-10">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 animate-rise sm:flex sm:justify-between md:border-b md:border-border md:pb-6">
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-red font-display font-bold shadow-red">M</div>
            <span className="font-display text-2xl font-bold tracking-tight">MARX</span>
          </div>
          <div className="hidden min-w-0 md:block"><h2 className="font-display text-xl font-bold">{["Visão geral","Carteira","Transações","Perfil"][tab]}</h2><p className="mt-1 text-sm text-muted-foreground">Seus investimentos</p></div>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" onClick={() => setHide(!hide)} className="grid h-10 w-10 place-items-center rounded-full bg-secondary transition active:scale-90" aria-label={hide ? "Mostrar valores" : "Ocultar valores"}>
              {hide ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
            <Button variant="ghost" onClick={() => setNotif(!notif)} aria-expanded={notif} className="relative grid h-10 w-10 place-items-center rounded-full bg-secondary transition active:scale-90" aria-label="Notificações">
              <Bell size={18} />{!readAll && <span className="absolute right-2.5 top-2.5 h-2 w-2 animate-pulse rounded-full bg-primary" />}
            </Button>
          </div>
        </header>
        {notif && (
          <div className="relative z-20">
            <div className="absolute right-0 top-2 w-full max-w-sm animate-rise rounded-2xl border border-border bg-card p-4 shadow-red">
              <div className="flex items-center justify-between"><p className="font-display font-bold">Notificações</p>
                <Button variant="ghost" className="h-auto px-2 py-1 text-xs text-primary" onClick={() => setReadAll(true)}>Marcar como lidas</Button></div>
              <ul className="mt-3 space-y-2 text-sm">
                {notifications.map((n) => (
                  <li key={n} className={`rounded-xl bg-secondary px-3 py-2 ${readAll ? "text-muted-foreground" : ""}`}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 0 && <div className="md:mt-8 md:grid md:grid-cols-[minmax(0,1fr)_300px] md:items-start md:gap-x-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-x-10">
        <div className="min-w-0">
        <section className="mt-6 animate-rise [animation-delay:80ms] md:mt-0">
          <p className="text-sm text-muted-foreground">Patrimônio {bank ? `· ${selectedBank?.name}` : "total"}</p>
          <h1 className="mt-1 font-display text-4xl font-bold tabular-nums break-words xl:text-5xl">{mask(brl(shown))}</h1>
          <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${pct >= 0 ? "bg-primary/15 text-primary" : "bg-secondary"}`}>
            {pct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{pct.toFixed(2)}% no período
          </span>
        </section>

        <section className="mt-4 -mx-2 h-52 md:mx-0 md:h-72 xl:h-80 animate-rise [animation-delay:160ms]">
          <ResponsiveContainer>
            <AreaChart data={data} key={range + bank}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <Tooltip cursor={{ stroke: "var(--border)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} labelStyle={{ color: "var(--muted-foreground)" }} formatter={(v: number) => [hide ? "••••" : brl(v), "Valor"]} />
              <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2.5} fill="url(#g)" animationDuration={1100} />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <div className="mt-2 flex gap-1 rounded-full bg-secondary p-1 md:ml-auto md:max-w-72">
          {(Object.keys(series) as Range[]).map((r) => (
            <Button variant="ghost" key={r} onClick={() => setRange(r)} aria-pressed={range === r} className={`flex-1 rounded-full py-2 text-xs font-medium transition-all duration-300 ${range === r ? "bg-primary text-primary-foreground shadow-red" : "text-muted-foreground"}`}>{r}</Button>
          ))}
        </div>

        </div>
        <section className="min-w-0 mt-8 animate-rise [animation-delay:240ms] md:col-start-1 md:row-start-2 md:mt-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <h2 className="font-display text-lg font-bold">Por instituição</h2>
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Link2 size={12} /> Open Finance</span>
          </div>
          <div className="mt-3 space-y-2">
            {banks.map((b, i) => {
              const active = bank === b.short;
              return (
                <Button variant="ghost" key={b.short} onClick={() => setBank(active ? null : b.short)} aria-pressed={active} style={{ animationDelay: `${300 + i * 80}ms` }}
                  className={`grid h-auto w-full grid-cols-[44px_minmax(0,1fr)_auto] animate-rise items-center gap-3 rounded-2xl border p-4 whitespace-normal hover:bg-secondary text-left transition-all duration-300 active:scale-[0.98] ${active ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
                  <div className={`grid h-11 w-11 place-items-center rounded-xl font-display text-sm font-bold ${active ? "bg-primary" : "bg-secondary"}`}>{b.short}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.name}</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${(b.value / total) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium tabular-nums">{mask(brl(b.value))}</p>
                    <p className="text-xs text-primary">+{b.ret}% a.a.</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </section>

        <section className="min-w-0 mt-8 rounded-3xl border border-border bg-card p-5 animate-rise [animation-delay:400ms] md:col-start-2 md:row-start-1 md:row-span-2 md:mt-0 md:rounded-none md:border-0 md:border-l md:bg-transparent md:pl-6 md:pr-0 md:pt-0 xl:pl-10">
          <h2 className="font-display text-lg font-bold">Por classe de ativo</h2>
          <div className="mt-2 flex items-center gap-4 md:flex-col xl:flex-row xl:gap-2">
            <div className="h-36 w-36 shrink-0 md:h-44 md:w-44 xl:h-36 xl:w-36">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={classes} dataKey="value" innerRadius={42} outerRadius={64} paddingAngle={3} stroke="none" animationDuration={1000} onClick={(d) => setCls(d.name)}>
                    {classes.map((c) => <Cell key={c.name} fill={c.color} opacity={cls === c.name ? 1 : 0.35} className="cursor-pointer transition-opacity" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5 md:w-full">
              {classes.map((c) => (
                <li key={c.name}>
                  <Button variant="ghost" onClick={() => setCls(c.name)} aria-pressed={cls === c.name} className={`flex h-auto w-full items-center gap-2 rounded-lg px-2 py-1 text-xs hover:bg-secondary transition ${cls === c.name ? "bg-secondary" : ""}`}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="flex-1 text-left">{c.name}</span>
                    <span className={c.ret >= 0 ? "text-primary" : "text-muted-foreground"}>{c.ret > 0 ? "+" : ""}{c.ret}%</span>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <div key={cls} className="mt-4 space-y-2 md:mt-6">
            {(assets[cls] ?? []).map((a, i) => (
              <div key={a.n} style={{ animationDelay: `${i * 70}ms` }} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 animate-rise items-center rounded-xl bg-secondary px-4 py-3">
                <div className="min-w-0"><p className="text-sm font-medium break-words">{a.n}</p><p className="text-xs text-muted-foreground">{banks.find(b => b.short === a.b)?.name}</p></div>
                <div className="text-right"><p className="text-sm tabular-nums">{mask(brl(a.v))}</p><p className={`text-xs ${a.r >= 0 ? "text-primary" : "text-muted-foreground"}`}>{a.r > 0 ? "+" : ""}{a.r}%</p></div>
              </div>
            ))}
          </div>
        </section>
        </div>}

        {tab === 1 && (
          <div className="mt-6 space-y-6 animate-rise md:mt-8 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
            {classes.map((c) => (
              <section key={c.name} className="rounded-3xl border border-border bg-card p-5">
                <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-lg font-bold"><span className="h-3 w-3 rounded-full" style={{ background: c.color }} />{c.name}</h2>
                  <span className="text-sm tabular-nums">{mask(brl(c.value))}</span></div>
                <div className="mt-3 space-y-2">
                  {(assets[c.name] ?? []).map((a) => (
                    <div key={a.n} className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
                      <div><p className="font-medium">{a.n}</p><p className="text-xs text-muted-foreground">{banks.find((b) => b.short === a.b)?.name}</p></div>
                      <div className="text-right"><p className="tabular-nums">{mask(brl(a.v))}</p><p className={`text-xs ${a.r >= 0 ? "text-primary" : "text-muted-foreground"}`}>{a.r > 0 ? "+" : ""}{a.r}%</p></div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {tab === 2 && (
          <section className="mt-6 animate-rise md:mt-8">
            <div className="flex gap-1 rounded-full bg-secondary p-1 md:max-w-sm">
              {["Todas", "Aportes", "Resgates", "Rendimentos"].map((f) => (
                <Button variant="ghost" key={f} onClick={() => setTxFilter(f)} aria-pressed={txFilter === f} className={`flex-1 rounded-full py-2 text-xs ${txFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{f}</Button>
              ))}
            </div>
            <ul className="mt-4 space-y-2">
              {transactions.filter((t) => txFilter === "Todas" || t.type === txFilter).map((t, i) => (
                <li key={i} style={{ animationDelay: `${i * 50}ms` }} className="flex animate-rise items-center justify-between rounded-2xl border border-border bg-card p-4 text-sm">
                  <div><p className="font-medium">{t.desc}</p><p className="text-xs text-muted-foreground">{t.date} · {t.bank} · {t.type}</p></div>
                  <p className={`tabular-nums ${t.v >= 0 ? "text-primary" : "text-muted-foreground"}`}>{mask((t.v >= 0 ? "+" : "") + brl(t.v))}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === 3 && (
          <section className="mt-6 max-w-xl space-y-4 animate-rise md:mt-8">
            <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-red font-display text-xl font-bold">G</div>
              <div><p className="font-display text-lg font-bold">Guilherme</p><p className="text-sm text-muted-foreground">Investidor · perfil moderado</p></div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5">
              <h2 className="font-display font-bold">Contas conectadas</h2>
              <ul className="mt-3 space-y-2">
                {banks.map((b) => (
                  <li key={b.short} className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
                    <span>{b.name}</span><span className="flex items-center gap-1 text-xs text-primary"><Link2 size={12} />Conectado</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="ghost" onClick={() => setHide(!hide)} className="h-12 w-full justify-between rounded-2xl border border-border bg-card px-5">
              <span>Ocultar valores</span>{hide ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </section>
        )}
      </div>

      <nav className="fixed inset-x-0 bottom-4 mx-auto flex md:hidden max-w-[22rem] justify-around rounded-full border border-border bg-card/90 p-2 backdrop-blur">
        {[Home, PieIcon, ArrowLeftRight, User].map((I, i) => (
          <Button variant="ghost" key={i} onClick={() => setTab(i)} aria-current={tab === i ? "page" : undefined} className={`grid h-12 w-12 place-items-center rounded-full transition-all duration-300 ${tab === i ? "bg-primary shadow-red" : "text-muted-foreground"}`} aria-label={["Início","Carteira","Transações","Perfil"][i]}><I size={20} /></Button>
        ))}
      </nav>
    </div>
  );
}
