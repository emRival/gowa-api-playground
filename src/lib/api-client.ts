import type { ApiEndpoint } from "@/lib/api-definitions";
import type { GlobalConfig } from "@/lib/config-store";
import type { CurlMode } from "@/lib/curl-builder";

export interface ProxyResponse {
  status: number;
  statusText: string;
  body: unknown;
  error?: string;
  hint?: string;
}

export async function sendRequest(
  endpoint: ApiEndpoint,
  config: GlobalConfig,
  values: Record<string, string>,
  files: Record<string, File>,
  mode: CurlMode
): Promise<ProxyResponse> {
  const formData = new FormData();

  // Build target URL
  let targetPath = endpoint.path;
  const pathParams = endpoint.params.filter((p) => p.isPathParam);
  for (const pp of pathParams) {
    const val = values[pp.name] || `{${pp.name}}`;
    targetPath = targetPath.replace(`:${pp.name}`, val);
  }
  const targetUrl = `${config.baseUrl || "http://localhost:3000"}${targetPath}`;

  // Proxy metadata
  formData.append("__proxy_url", targetUrl);
  formData.append("__proxy_method", endpoint.method);

  // Determine body type
  const bodyType =
    endpoint.supportsUrlMode && mode === "json"
      ? "json"
      : endpoint.bodyType === "form-data" || (endpoint.supportsUrlMode && mode === "form-data")
        ? "form-data"
        : endpoint.bodyType;
  formData.append("__proxy_body_type", bodyType);

  // Auth
  if (config.username && config.password) {
    const encoded = btoa(`${config.username}:${config.password}`);
    formData.append("__proxy_auth", `Basic ${encoded}`);
  }

  // Device ID
  if (config.deviceId) {
    formData.append("__proxy_device_id", config.deviceId);
  }

  // Add form values
  const bodyParams = endpoint.params.filter((p) => !p.isPathParam);
  for (const p of bodyParams) {
    // Skip file fields in JSON mode
    if (mode === "json" && p.type === "file") continue;
    // Skip URL fields in form-data mode
    if (mode === "form-data" && p.name.endsWith("_url")) continue;

    if (p.type === "file" && files[p.name]) {
      formData.append(p.name, files[p.name]);
    } else if (values[p.name]) {
      formData.append(p.name, values[p.name]);
    }
  }

  const res = await fetch("/api/proxy", {
    method: "POST",
    body: formData,
  });

  return res.json();
}
