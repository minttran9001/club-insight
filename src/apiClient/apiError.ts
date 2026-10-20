export type APIErrorKind = "network" | "http" | "invalid-response" | "unexpected";

export class APIError extends Error {
  readonly kind: APIErrorKind;
  readonly status: number | undefined;

  constructor(kind: APIErrorKind, message: string, options: { status?: number; cause?: unknown } = {}) {
    super(message, { cause: options.cause });
    this.name = "APIError";
    this.kind = kind;
    this.status = options.status;
  }
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof APIError ? error.message : fallback;
}
