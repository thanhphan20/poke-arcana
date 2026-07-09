export type FailureReason =
  | '5xx_retry_exhausted'
  | 'network_timeout'
  | '429'
  | '401_403'
  | 'bad_request'
  | 'schema_validation_failed'
  | 'no_key';

export interface Attempt {
  provider: string;
  reason: FailureReason;
}

export class NetworkError extends Error {}

export class TimeoutError extends Error {}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type ProviderError = NetworkError | TimeoutError | HttpError;

export interface ProviderAdapter {
  name: string;
  /** False when the required API key env var is unset; the chain skips this provider entirely. */
  configured: boolean;
  /** Sends the prompt and returns the raw text body. Throws ProviderError on failure. */
  send(system: string, user: string): Promise<{ raw: string }>;
}

export interface ReadingCard {
  position: string;
  arcana: string;
  pokemon: string;
  interpretation: string;
}

export interface ReadingResponse {
  cards: ReadingCard[];
  synthesis: string;
}

export class ProviderChainExhausted extends Error {
  attempts: Attempt[];
  constructor(attempts: Attempt[]) {
    super('All configured providers failed');
    this.attempts = attempts;
  }
}

export interface GenerateResult {
  provider: string;
  response: ReadingResponse;
  attempts: Attempt[];
}
