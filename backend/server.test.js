const test = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { createApp, parseSymbols } = require("./server");

async function localUrl(t, options = {}) {
  const server = createApp({ baseUrl: "https://brapi.dev/api/", token: "", corsOrigins: [], ...options }).listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  return `http://127.0.0.1:${server.address().port}`;
}

test("normaliza tickers e elimina duplicados", () => {
  assert.deepEqual(parseSymbols(" petr4,VALE3,petr4,^bvsp,../../etc "), ["PETR4", "VALE3", "^BVSP"]);
});

test("as três rotas usam os caminhos e parâmetros v2; a chave nunca aparece na resposta", async (t) => {
  const calls = [];
  const body = { results: [{ symbol: "PETR4", data: { regularMarketPrice: 42 } }] };
  const url = await localUrl(t, {
    token: "test-key-not-real",
    fetchImpl: async (upstream, options) => {
      calls.push([upstream.pathname, Object.fromEntries(upstream.searchParams), options.headers.Authorization, options.redirect]);
      return Response.json(body);
    },
  });
  for (const route of ["/api/quotes?symbols=petr4,VALE3,petr4", "/api/history/petr4", "/api/dividends?symbols=PETR4&startDate=2026-01-01&endDate=2026-02-28"]) {
    const response = await fetch(url + route);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), body);
  }
  assert.deepEqual(calls, [
    ["/api/v2/stocks/quote", { symbols: "PETR4,VALE3" }, "Bearer test-key-not-real", "error"],
    ["/api/v2/stocks/historical", { symbols: "PETR4", range: "1mo", interval: "1d" }, "Bearer test-key-not-real", "error"],
    ["/api/v2/stocks/dividends", { symbols: "PETR4", startDate: "2026-01-01", endDate: "2026-02-28" }, "Bearer test-key-not-real", "error"],
  ]);
});

test("rejeita entrada inválida sem consultar o provedor", async (t) => {
  let calls = 0;
  const url = await localUrl(t, { fetchImpl: async () => { calls++; return Response.json({ results: [] }); } });
  for (const route of ["/api/quotes", "/api/quotes?symbols=PETR4,foo/bar", "/api/history/PETR4,VALE3",
    "/api/history/PETR4?range=invalid", "/api/dividends?symbols=PETR4&startDate=2026-02-30",
    "/api/dividends?symbols=PETR4&startDate=2026-03-01&endDate=2026-02-28"]) {
    assert.equal((await fetch(url + route)).status, 400, route);
  }
  assert.equal(calls, 0);
});

test("trata limite, erro de credencial, resposta inválida e timeout", async (t) => {
  const outputs = [
    () => Response.json({ message: "detail-to-hide" }, { status: 429 }),
    () => Response.json({ message: "detail-to-hide" }, { status: 401 }),
    () => new Response("not-json"),
    () => Response.json({ unexpected: true }),
    () => { throw new DOMException("detail-to-hide", "TimeoutError"); },
    () => { throw new TypeError("detail-to-hide"); },
  ];
  const url = await localUrl(t, { fetchImpl: async () => outputs.shift()() });
  for (const expected of [429, 502, 502, 502, 504, 503]) {
    const response = await fetch(url + "/api/quotes?symbols=PETR4");
    assert.equal(response.status, expected);
    const { error } = await response.json();
    assert.ok(error);
    assert.doesNotMatch(error, /detail-to-hide/);
  }
});

test("não envia a chave a um host alternativo nem libera CORS para qualquer site", async (t) => {
  const url = await localUrl(t, {
    baseUrl: "https://example.test/api", token: "test-key-not-real",
    fetchImpl: async (_url, { headers }) => {
      assert.equal(headers.Authorization, undefined);
      return Response.json({ results: [] });
    },
  });
  for (const origin of ["http://localhost:5173", "https://unrelated.example"]) {
    const response = await fetch(url + "/api/quotes?symbols=PETR4", { headers: { Origin: origin } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), origin.includes("localhost") ? origin : null);
  }
});
