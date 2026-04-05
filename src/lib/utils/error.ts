export function logRuntimeError(message: string, error: unknown, ...details: unknown[]) {
  console.error(message, error, ...details)
}
