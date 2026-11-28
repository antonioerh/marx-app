const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("node:path");

dotenv.config({ path: path.resolve(__dirname, "..", ".env"), quiet: true });

const BRAPI_URL = "https://brapi.dev/api/";
const MAX_SYMBOLS = 20;
const SYMBOL = /^\^?[A-Z0-9]{1,12}(?:\.SA)?$/;
const RANGES = new Set(["1d", "2d", "5d", "7d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"]);
const INTERVALS = new Set(["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo"]);

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

function symbolParts(value) {
  return (Array.isArray(value) ? value : [value])
    .flatMap((item) => (typeof item === "string" ? item.split(",") : [""]))
    .map((item) => item.trim().toUpperCase());
}

function parseSymbols(value) {
  return [...new Set(symbolParts(value).filter((item) => SYMBOL.test(item)))];
}

function readSymbols(value) {
  const parts = symbolParts(value);
  if (parts.length > MAX_SYMBOLS || parts.some((part) => !SYMBOL.test(part))) {
    throw httpError(400, `Informe de 1 a ${MAX_SYMBOLS} tickers válidos em symbols, separados por vírgula.`);
  }
  return parseSymbols(value);
}

function readDate(value, name) {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw httpError(400, `${name} deve ser uma data válida no formato AAAA-MM-DD.`);
  }
  const date = new Date(value + "T00:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw httpError(400, `${name} deve ser uma data válida no formato AAAA-MM-DD.`);
  }
  return value;
}

function createApp({
  fetchImpl = globalThis.fetch,
  token = process.env.BRAPI_API_KEY || process.env.BRAPI_TOKEN || "",
  baseUrl = process.env.BRAPI_BASE_URL || BRAPI_URL,
  corsOrigins = (process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean),
} = {}) {
  const app = express();
  const base = new URL(baseUrl.endsWith("/") ? baseUrl : baseUrl + "/");
  const credentialOrigin = new URL(BRAPI_URL).origin;
  app.use(cors({
    origin: (origin, callback) => callback(null, Boolean(origin && (
      /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin) || corsOrigins.includes(origin)
    ))),
  }));
  app.use(express.json({ limit: "100kb" }));

  async function brapiRequest(endpoint, params) {
    const url = new URL(`v2/stocks/${endpoint}`, base);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }

    const headers = { Accept: "application/json" };
    if (token.trim() && url.origin === credentialOrigin) headers.Authorization = `Bearer ${token.trim()}`;

    let response;
    try {
      response = await fetchImpl(url, { headers, redirect: "error", signal: AbortSignal.timeout(15_000) });
    } catch (error) {
      if (error?.name === "TimeoutError" || error?.name === "AbortError") {
        throw httpError(504, "A brapi demorou para responder.");
      }
      throw httpError(503, "Não foi possível conectar à brapi.");
    }

    if (!response.ok) {
      const errors = {
        400: [400, "A brapi não aceitou os parâmetros ou a consulta excede o limite do plano."],
        401: [502, "A brapi recusou a autenticação. Confira a chave no backend."],
        403: [502, "A brapi recusou o acesso. Confira a chave e o plano no backend."],
        404: [404, "A brapi não encontrou dados para a consulta."],
        429: [429, "Limite de consultas à brapi atingido. Tente novamente mais tarde."],
      };
      throw httpError(...(errors[response.status] || [502, "A brapi não conseguiu completar a consulta."]));
    }

    let body;
    try {
      body = await response.json();
    } catch {
      throw httpError(502, "A brapi retornou uma resposta inválida.");
    }
    if (!Array.isArray(body?.results)) throw httpError(502, "A brapi retornou uma resposta inválida.");
    return body;
  }

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.get("/api/quotes", async (req, res) => {
    const symbols = readSymbols(req.query.symbols);
    res.json(await brapiRequest("quote", { symbols: symbols.join(",") }));
  });

  app.get("/api/history/:symbol", async (req, res) => {
    const symbol = req.params.symbol.trim().toUpperCase();
    if (!SYMBOL.test(symbol)) throw httpError(400, "Informe um único ticker válido.");
    const { range = "1mo", interval = "1d" } = req.query;
    if (!RANGES.has(range) || !INTERVALS.has(interval)) {
      throw httpError(400, "Informe range e interval válidos, por exemplo 1mo e 1d.");
    }
    res.json(await brapiRequest("historical", { symbols: symbol, range, interval }));
  });

  app.get("/api/dividends", async (req, res) => {
    const symbols = readSymbols(req.query.symbols);
    const startDate = readDate(req.query.startDate, "startDate");
    const endDate = readDate(req.query.endDate, "endDate");
    if (startDate && endDate && startDate > endDate) {
      throw httpError(400, "startDate não pode ser posterior a endDate.");
    }
    res.json(await brapiRequest("dividends", { symbols: symbols.join(","), startDate, endDate }));
  });

  app.use((error, _req, res, _next) => {
    const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600 ? error.status : 500;
    const message = error.type === "entity.parse.failed" ? "JSON inválido." : (
      status === 500 ? "Erro interno do servidor." : error.message
    );
    res.status(status).json({ error: message });
  });

  return app;
}

const app = createApp();
if (require.main === module) {
  const port = Number(process.env.PORT || process.env.port || 3000);
  const host = process.env.HOST || "127.0.0.1";
  app.listen(port, host, () => console.log(`Backend rodando em http://${host}:${port}`));
}

module.exports = { app, createApp, parseSymbols };
