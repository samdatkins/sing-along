export function createCSRF() {
  return (crypto.randomUUID() + crypto.randomUUID())
    .replaceAll("-", "")
    .substring(0, 64);
}

export async function handleFailedRequest(error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  const { config } = error;
  if (config && config.noRetry) {
    return Promise.reject(error);
  }
  const hasExpiredSession =
    error?.response?.status === 403 &&
    error?.response?.data?.detail !== undefined &&
    typeof error.response.data.detail === "string" &&
    error.response.data.detail.includes(
      "Authentication credentials were not provided"
    );

  if (hasExpiredSession) {
    if (window.location.href.includes("localhost")) {
      window.location.href = "http://localhost:8080/";
    } else {
      window.location.href = "/";
    }
  }
  return Promise.reject(error);
}
