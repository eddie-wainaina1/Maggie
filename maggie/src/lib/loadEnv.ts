// Lightweight env loader for local development.
// This will load vars from .env, .env.local etc. into process.env when
// server-side modules import this file.
import dotenv from "dotenv";

// Only load in non-production by default, but allow explicit override.
const shouldLoad = process.env.NEXT_PUBLIC_SKIP_DOTENV !== "true";
if (shouldLoad) {
  dotenv.config();
}

export {};
