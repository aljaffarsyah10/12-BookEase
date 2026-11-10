import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { alerting } from "@/lib/alerting";
import { errorTracker } from "@/lib/error-tracker";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { metrics } from "@/lib/metrics";

export interface ApiResponseSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiResponseError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function apiSuccess<T>(
  data: T,
  message = "Operation successful",
  status = 200
): NextResponse<ApiResponseSuccess<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiResponseError> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status }
  );
}

export function handleApiError(
  err: unknown,
  context?: { path?: string; method?: string }
): NextResponse<ApiResponseError> {
  const requestId = logger.generateRequestId();

  // Let Next.js internal control flow errors (bailout, redirect, notFound, dynamic cookies) bubble up
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    if (digest.startsWith("NEXT_") || digest === "HANGING_PROMISE_REJECTION") {
      throw err;
    }
  }

  // AppError: Controlled domain & validation business errors
  if (err instanceof AppError) {
    logger.warn(`[API_APP_ERROR] ${err.code}: ${err.message}`, {
      requestId,
      code: err.code,
      status: err.status,
      ...context,
    });
    return apiError(err.code, err.message, err.status, err.details);
  }

  if (
    err instanceof Error &&
    "code" in err &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
  ) {
    const customErr = err as Error & { code: string; status: number };
    return apiError(customErr.code, customErr.message, customErr.status);
  }

  if (err instanceof ZodError) {
    logger.debug("[API_VALIDATION_ERROR] Zod payload rejection", {
      requestId,
      ...context,
    });
    return apiError(
      "VALIDATION_ERROR",
      "Periksa kembali data yang Anda kirimkan.",
      400,
      err.flatten().fieldErrors
    );
  }

  // Track unhandled server error with error tracker, metrics, and alerting
  const trackedEvent = errorTracker.captureException(err, {
    requestId,
    ...context,
  });

  alerting.recordHttpResult(500, context?.path || "api");
  metrics.recordRequest({
    path: context?.path || "/api",
    method: context?.method || "UNKNOWN",
    statusCode: 500,
    durationMs: 0,
    timestamp: Date.now(),
  });

  return apiError(
    "INTERNAL_SERVER_ERROR",
    "Terjadi kendala pada sistem server. Tim teknis telah diberi notifikasi.",
    500,
    {
      requestId,
      referenceCode: trackedEvent.fingerprint,
    }
  );
}
