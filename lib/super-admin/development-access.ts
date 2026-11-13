/** Explicitly limits the temporary Super Admin bypass to Next.js development mode. */
export function isDevelopmentBypassEnabled() {
  return process.env.NODE_ENV === "development";
}
