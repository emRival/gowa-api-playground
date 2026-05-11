import type { ApiEndpoint } from "@/lib/api-definitions";
import type { GlobalConfig } from "@/lib/config-store";

export function generateSnippet(
  lang: "js" | "python" | "php" | "go",
  endpoint: ApiEndpoint,
  config: GlobalConfig,
  values: Record<string, string>,
  mode: "json" | "form-data",
  isRaw: boolean = false
): string {
  const activeConfig: Partial<GlobalConfig> = isRaw ? {} : config;
  const activeValues = { ...values };

  // Ensure all parameters have at least a placeholder value for visualization
  endpoint.params.forEach((p) => {
    if (isRaw || !activeValues[p.name]) {
      let fallback = p.placeholder || `{${p.name}}`;
      if (p.type === "boolean") fallback = "false";
      if (p.type === "select" && p.options && p.options.length > 0) fallback = p.options[0].value;

      if (isRaw) {
        activeValues[p.name] = fallback;
      } else if (!activeValues[p.name]) {
        activeValues[p.name] = fallback;
      }
    }
  });

  const baseUrl = activeConfig.baseUrl || "http://localhost:3000";
  const url = `${baseUrl}${endpoint.path}`;

  // Replace path parameters
  let resolvedUrl = url;
  const pathParams = endpoint.params.filter((p) => p.isPathParam);
  for (const pp of pathParams) {
    const val = activeValues[pp.name] || `{${pp.name}}`;
    resolvedUrl = resolvedUrl.replace(`:${pp.name}`, val);
  }

  // Get body parameters
  const bodyParams = endpoint.params.filter((p) => !p.isPathParam);
  const payload: Record<string, unknown> = {};
  for (const p of bodyParams) {
    if (p.type === "boolean") {
      payload[p.name] = activeValues[p.name] === "true";
    } else {
      payload[p.name] = activeValues[p.name] || "";
    }
  }

  // Auth header
  let authVal = "YOUR_USERNAME:YOUR_PASSWORD";
  if (activeConfig.username && activeConfig.password) {
    authVal = btoa(`${activeConfig.username}:${activeConfig.password}`);
    authVal = `Basic ${authVal}`;
  }

  const deviceId = activeConfig.deviceId || "YOUR_DEVICE_ID";

  if (lang === "js") {
    const isPost = endpoint.method === "POST" || endpoint.method === "DELETE";
    return `// Menggunakan Fetch API asli JavaScript
const myHeaders = new Headers();
myHeaders.append("Authorization", "${authVal.startsWith("Basic ") ? authVal : "Basic " + authVal}");
myHeaders.append("X-Device-Id", "${deviceId}");
${isPost ? 'myHeaders.append("Content-Type", "application/json");' : ''}

const raw = JSON.stringify(${JSON.stringify(payload, null, 2)});

const requestOptions = {
  method: "${endpoint.method}",
  headers: myHeaders,
  ${isPost ? 'body: raw,' : ''}
  redirect: "follow"
};

fetch("${resolvedUrl}", requestOptions)
  .then((response) => response.json())
  .then((result) => console.log(result))
  .catch((error) => console.error("Error:", error));`;
  }

  if (lang === "python") {
    const isPost = endpoint.method === "POST" || endpoint.method === "DELETE";
    return `# Menggunakan library 'requests' Python (pip install requests)
import requests
import json

url = "${resolvedUrl}"
headers = {
    "Authorization": "${authVal.startsWith("Basic ") ? authVal : "Basic " + authVal}",
    "X-Device-Id": "${deviceId}",
    ${isPost ? '"Content-Type": "application/json"' : ''}
}
${isPost ? `payload = json.dumps(${JSON.stringify(payload, null, 4)})` : ''}

response = requests.request(
    "${endpoint.method}",
    url,
    headers=headers,
    ${isPost ? 'data=payload' : ''}
)

print(response.json())`;
  }

  if (lang === "php") {
    const isPost = endpoint.method === "POST" || endpoint.method === "DELETE";
    const headerLines = [
      `    "Authorization: ${authVal.startsWith("Basic ") ? authVal : "Basic " + authVal}"`,
      `    "X-Device-Id: ${deviceId}"`,
    ];
    if (isPost) {
      headerLines.push('    "Content-Type: application/json"');
    }
    
    return `<?php
// Menggunakan Extension cURL asli PHP
$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => "${resolvedUrl}",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "${endpoint.method}",
    ${isPost ? `CURLOPT_POSTFIELDS => '${JSON.stringify(payload, null, 4)}',` : ''}
    CURLOPT_HTTPHEADER => [
    ${headerLines.join(",\n    ")}
    ],
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`;
  }

  if (lang === "go") {
    const isPost = endpoint.method === "POST" || endpoint.method === "DELETE";
    return `package main

import (
    "fmt"
    "io"
    "net/http"
    ${isPost ? '"strings"' : ''}
)

func main() {
    url := "${resolvedUrl}"
    method := "${endpoint.method}"

    ${isPost ? `payload := strings.NewReader(\`${JSON.stringify(payload, null, 4)}\`)` : ""}

    client := &http.Client{}
    req, err := http.NewRequest(method, url, ${isPost ? "payload" : "nil"})
    if err != nil {
        fmt.Println(err)
        return
    }

    req.Header.Add("Authorization", "${authVal.startsWith("Basic ") ? authVal : "Basic " + authVal}")
    req.Header.Add("X-Device-Id", "${deviceId}")
    ${isPost ? 'req.Header.Add("Content-Type", "application/json")' : ''}

    res, err := client.Do(req)
    if err != nil {
        fmt.Println(err)
        return
    }
    defer res.Body.Close()

    body, err := io.ReadAll(res.Body)
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println(string(body))
}`;
  }

  return "";
}
