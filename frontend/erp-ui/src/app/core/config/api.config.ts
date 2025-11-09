export type AppConfig = {
  authBase?: string;
  hrBase?: string;
  financeBase?: string;
  reportingBase?: string;
};

export function resolveApiBase(key: keyof AppConfig, fallback: string): string {
  const w = (globalThis as any || {});
  const cfg = (w.__APP_CONFIG__ as AppConfig) || {};
  return (cfg[key] as string) || fallback;
}

export const API_BASES = {
  auth: resolveApiBase('authBase', '/api/auth'),
  hr: resolveApiBase('hrBase', '/api/hr'),
  finance: resolveApiBase('financeBase', '/api/finance'),
  reporting: resolveApiBase('reportingBase', '/api/reporting')
};

