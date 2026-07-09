import { HttpError, NetworkError, TimeoutError } from './types';

const ATTEMPT_TIMEOUT_MS = 20_000;

/**
 * Fetch with a hard per-attempt timeout, translating network/timeout/HTTP
 * failures into the ProviderError types the retry/fallback chain classifies on.
 */
export async function fetchJson(url: string, init: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new TimeoutError('Request timed out');
    }
    throw new NetworkError(err instanceof Error ? err.message : 'Network request failed');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new HttpError(res.status, body || res.statusText);
  }

  return res.json();
}
