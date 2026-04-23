import { AnalysisResult, HealthInputs } from "./types";

export interface SharePayload {
  v: 1;
  exp: number;
  inputs: Partial<HealthInputs>;
  report: AnalysisResult;
}

function utf8ToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUtf8(input: string): string {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const binary = atob(s);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function buildShareUrl(inputs: Partial<HealthInputs>, report: AnalysisResult, hoursValid = 24): string {
  const slim: Partial<HealthInputs> = {
    age: inputs.age,
    gender: inputs.gender,
    height: inputs.height,
    weight: inputs.weight,
    conditions: inputs.conditions,
  };
  const payload: SharePayload = {
    v: 1,
    exp: Date.now() + hoursValid * 3600 * 1000,
    inputs: slim,
    report,
  };
  const encoded = utf8ToBase64Url(JSON.stringify(payload));
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/");
  return `${base}#share=${encoded}`;
}

export function parseShareFragment(): { payload: SharePayload | null; expired: boolean } {
  const hash = window.location.hash;
  const m = hash.match(/share=([^&]+)/);
  if (!m) return { payload: null, expired: false };
  try {
    const json = base64UrlToUtf8(m[1]);
    const payload = JSON.parse(json) as SharePayload;
    if (payload.v !== 1) return { payload: null, expired: false };
    if (payload.exp < Date.now()) return { payload: null, expired: true };
    return { payload, expired: false };
  } catch {
    return { payload: null, expired: false };
  }
}
