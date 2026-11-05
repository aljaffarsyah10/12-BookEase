import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

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

export function handleApiError(err: unknown): NextResponse<ApiResponseError> {
  // Let Next.js internal control flow errors (bailout, redirect, notFound, dynamic cookies) bubble up
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    if (digest.startsWith("NEXT_") || digest === "HANGING_PROMISE_REJECTION") {
      throw err;
    }
  }

  if (err instanceof AppError) {
    return apiError(err.code, err.message, err.status, err.details);
  }

  if (err instanceof ZodError) {
    return apiError(
      "VALIDATION_ERROR",
      "Periksa kembali data yang Anda kirimkan.",
      400,
      err.flatten().fieldErrors
    );
  }

  console.error("[API_UNCAUGHT_ERROR]", err);
  return apiError(
    "INTERNAL_SERVER_ERROR",
    "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
    500
  );
}
