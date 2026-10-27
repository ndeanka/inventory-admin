export interface ApiErrorBody {
  message?: string;
  details?: string[];
}

export function apiErrorMessage(
  err: { error?: ApiErrorBody; status?: number },
  fallback: string
): string {
  const details = (err.error?.details ?? []).map((detail) => detail.trim()).filter(Boolean);
  if (details.length > 0) {
    return details.join('; ');
  }
  if (err.error?.message) {
    return err.error.message;
  }
  return fallback;
}
