import type {
  ImportBatchResult,
  ImportEnvelope,
  ImportJobType,
  ImportSessionDetail,
} from "./contracts";

interface TradingWebConfig {
  baseUrl: string;
  token: string;
  sourceStore: string;
}

export function getTradingWebConfig(): TradingWebConfig {
  const baseUrl = process.env.TRADINGWEB_API_URL?.trim().replace(/\/$/, "");
  const token = process.env.TRADINGWEB_IMPORT_TOKEN?.trim();
  const sourceStore = process.env.SHOPIFY_SOURCE_STORE?.trim();

  if (!baseUrl) throw new Error("TRADINGWEB_API_URL is required");
  if (!token) throw new Error("TRADINGWEB_IMPORT_TOKEN is required");
  if (!sourceStore) throw new Error("SHOPIFY_SOURCE_STORE is required");

  return { baseUrl, token, sourceStore };
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  config: TradingWebConfig = getTradingWebConfig(),
): Promise<T> {
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let body: unknown = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text.slice(0, 500) };
    }
  }

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error?: unknown }).error)
        : `TradingWEB request failed with HTTP ${response.status}`;
    throw new Error(message);
  }
  return body as T;
}

export async function createImportSession(
  jobType: ImportJobType,
  config: TradingWebConfig = getTradingWebConfig(),
): Promise<{ session_id: string; created_at: string }> {
  return requestJson("/admin/import/sessions", {
    method: "POST",
    body: JSON.stringify({
      source: "shopify",
      source_store: config.sourceStore,
      expected_jobs: [jobType],
      customer_link_strategy: "auto_create_user",
    }),
  }, config);
}

export async function sendImportEnvelope<T>(
  jobType: ImportJobType,
  sessionId: string,
  envelope: ImportEnvelope<T>,
  config: TradingWebConfig = getTradingWebConfig(),
): Promise<ImportBatchResult> {
  return requestJson(
    `/admin/import/${jobType}?session_id=${encodeURIComponent(sessionId)}`,
    { method: "POST", body: JSON.stringify(envelope) },
    config,
  );
}

export async function validateImportEnvelope<T>(
  jobType: ImportJobType,
  envelope: ImportEnvelope<T>,
  config: TradingWebConfig = getTradingWebConfig(),
): Promise<ImportBatchResult> {
  return requestJson(
    `/admin/import/validate?type=${encodeURIComponent(jobType)}&check_references=${jobType === "orders"}`,
    { method: "POST", body: JSON.stringify(envelope) },
    config,
  );
}

export async function getImportSession(
  sessionId: string,
  config: TradingWebConfig = getTradingWebConfig(),
): Promise<ImportSessionDetail> {
  return requestJson(
    `/admin/import/sessions/${encodeURIComponent(sessionId)}`,
    { method: "GET" },
    config,
  );
}

export async function listImportSessions(
  config: TradingWebConfig = getTradingWebConfig(),
): Promise<{ data: ImportSessionDetail[]; total: number }> {
  const query = new URLSearchParams({
    source: "shopify",
    source_store: config.sourceStore,
    pageSize: "50",
  });
  return requestJson(
    `/admin/import/sessions?${query.toString()}`,
    { method: "GET" },
    config,
  );
}

export async function importEnvelope<T>(
  jobType: ImportJobType,
  records: T[],
  config: TradingWebConfig = getTradingWebConfig(),
): Promise<{ sessionId: string; result: ImportBatchResult }> {
  const session = await createImportSession(jobType, config);
  const envelope: ImportEnvelope<T> = {
    source: "shopify",
    source_store: config.sourceStore,
    schema_version: "1",
    records,
  };
  const result = await sendImportEnvelope(
    jobType,
    session.session_id,
    envelope,
    config,
  );
  return { sessionId: session.session_id, result };
}
