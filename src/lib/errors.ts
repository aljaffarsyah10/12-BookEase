export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "EMAIL_ALREADY_EXISTS"
  | "SLUG_ALREADY_EXISTS"
  | "BUSINESS_NOT_FOUND"
  | "SERVICE_NOT_FOUND"
  | "STAFF_NOT_FOUND"
  | "BOOKING_NOT_FOUND"
  | "SERVICE_UNAVAILABLE"
  | "SLOT_UNAVAILABLE"
  | "BOOKING_CONFLICT"
  | "INVALID_STATUS_TRANSITION"
  | "INVALID_TOKEN"
  | "ALREADY_CANCELLED"
  | "CANNOT_CANCEL_FINAL"
  | "TIME_POLICY_VIOLATION"
  | "RATE_LIMIT_EXCEEDED"
  | "INVALID_PLAN"
  | "INVOICE_NOT_FOUND"
  | "SUBSCRIPTION_EXPIRED"
  | "SERVICE_LIMIT_REACHED"
  | "STAFF_LIMIT_REACHED"
  | "BOOKING_LIMIT_REACHED"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(
    code: AppErrorCode,
    message: string,
    status = 400,
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
