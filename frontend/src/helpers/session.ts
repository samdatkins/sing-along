export function createCSRF() {
  return (crypto.randomUUID() + crypto.randomUUID())
    .replaceAll("-", "")
    .substring(0, 64);
}
