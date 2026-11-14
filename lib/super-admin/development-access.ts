/** Allows the temporary Super Admin bypass only by explicit opt-in in development. */
export function isDevelopmentBypassEnabled() {
  return process.env.NODE_ENV === "development" && process.env.SUPER_ADMIN_DEV_AUTH_BYPASS === "true";
}
