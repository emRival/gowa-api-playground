import type { ApiEndpoint } from "@/lib/api-definitions";
import type { GlobalConfig } from "@/lib/config-store";

export type CurlMode = "json" | "form-data";

export function buildCurl(
  endpoint: ApiEndpoint,
  config: GlobalConfig,
  values: Record<string, string>,
  mode: CurlMode,
  isRaw: boolean = false
): string {
  const parts: string[] = ["curl -s"];

  const activeConfig: Partial<GlobalConfig> = isRaw ? {} : config;
  
  // Ensure all parameters have at least a placeholder value for visualization
  const activeValues = { ...values };
  endpoint.params.forEach((p) => {
    if (isRaw || !activeValues[p.name]) {
      // Determine appropriate fallback
      let fallback = p.placeholder || `{${p.name}}`;
      if (p.type === "boolean") fallback = "false";
      if (p.type === "select" && p.options && p.options.length > 0) fallback = p.options[0].value;
      
      // In raw mode, override existing value. In active mode, only use fallback if empty.
      if (isRaw) {
        activeValues[p.name] = fallback;
      } else if (!activeValues[p.name]) {
        activeValues[p.name] = fallback;
      }
    }
  });

  // Method
  parts.push(`-X ${endpoint.method}`);

  // Build URL
  let url = `${activeConfig.baseUrl || "http://localhost:3000"}${endpoint.path}`;

  // Replace path params like :message_id
  const pathParams = endpoint.params.filter((p) => p.isPathParam);
  for (const pp of pathParams) {
    const val = activeValues[pp.name] || `{${pp.name}}`;
    url = url.replace(`:${pp.name}`, val);
  }

  // Query params for GET requests
  const queryParams = endpoint.params.filter(
    (p) => !p.isPathParam && endpoint.method === "GET" && activeValues[p.name]
  );
  if (queryParams.length > 0) {
    const qs = queryParams
      .map((p) => `${p.name}=${encodeURIComponent(activeValues[p.name])}`)
      .join("&");
    url += `?${qs}`;
  }

  // Auth header
  if (activeConfig.username && activeConfig.password) {
    const encoded = btoa(`${activeConfig.username}:${activeConfig.password}`);
    parts.push(`-H "Authorization: Basic ${encoded}"`);
  } else {
    parts.push(`-u "YOUR_USERNAME:YOUR_PASSWORD"`);
  }

  // Device ID header
  if (activeConfig.deviceId) {
    parts.push(`-H "X-Device-Id: ${activeConfig.deviceId}"`);
  } else {
    parts.push(`-H "X-Device-Id: YOUR_DEVICE_ID"`);
  }

  // Body
  if (endpoint.method === "POST" || endpoint.method === "DELETE") {
    const bodyParams = endpoint.params.filter((p) => !p.isPathParam);
    const hasValues = bodyParams.some((p) => activeValues[p.name]);

    if (endpoint.supportsUrlMode && mode === "json") {
      // JSON mode for media endpoints
      parts.push('-H "Content-Type: application/json"');
      if (hasValues) {
        const jsonBody: Record<string, unknown> = {};
        for (const p of bodyParams) {
          if (!activeValues[p.name]) continue;
          if (p.type === "file") continue; // skip file fields in JSON mode
          if (p.type === "boolean") {
            jsonBody[p.name] = activeValues[p.name] === "true";
          } else {
            jsonBody[p.name] = activeValues[p.name];
          }
        }
        parts.push(`-d '${JSON.stringify(jsonBody, null, 2)}'`);
      }
    } else if (endpoint.bodyType === "form-data" || (endpoint.supportsUrlMode && mode === "form-data")) {
      // Form-data mode
      for (const p of bodyParams) {
        if (!activeValues[p.name]) continue;
        if (p.type === "file") {
          parts.push(`-F "${p.name}=@${activeValues[p.name]}"`);
        } else if (p.type === "boolean") {
          parts.push(`-F "${p.name}=${activeValues[p.name]}"`);
        } else {
          parts.push(`-F "${p.name}=${activeValues[p.name]}"`);
        }
      }
    } else if (endpoint.bodyType === "json") {
      parts.push('-H "Content-Type: application/json"');
      if (hasValues) {
        const jsonBody: Record<string, unknown> = {};
        for (const p of bodyParams) {
          if (!activeValues[p.name]) continue;
          if (p.type === "boolean") {
            jsonBody[p.name] = activeValues[p.name] === "true";
          } else {
            jsonBody[p.name] = activeValues[p.name];
          }
        }
        parts.push(`-d '${JSON.stringify(jsonBody, null, 2)}'`);
      }
    }
  }

  // URL goes last
  parts.push(`"${url}"`);

  return parts.join(" \\\n  ");
}
