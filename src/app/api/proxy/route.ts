import { NextRequest, NextResponse } from "next/server";
import path from "path";

// Allowed MIME types for file uploads
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/zip",
  "audio/ogg",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB - WhatsApp limit

// Dangerous file extensions to block
const BLOCKED_EXTENSIONS = [
  ".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js", ".mjs",
  ".php", ".py", ".rb", ".pl", ".jar", ".com", ".scr", ".pif",
  ".msi", ".dll", ".sys", ".reg", ".inf", ".hta", ".cpl",
];

function validateFile(file: File | Blob, fileName: string): { valid: boolean; error?: string } {
  // Check size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is 16MB, got ${(file.size / 1024 / 1024).toFixed(1)}MB` };
  }

  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `File type "${file.type}" is not allowed. Allowed: images, documents, audio, video` };
  }

  // Check extension
  const ext = path.extname(fileName).toLowerCase();
  if (ext && BLOCKED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `File extension "${ext}" is blocked for security reasons` };
  }

  // Check for double extensions (e.g., file.jpg.exe)
  const nameParts = fileName.split(".");
  if (nameParts.length > 2) {
    const lastExt = `.${nameParts[nameParts.length - 1].toLowerCase()}`;
    if (BLOCKED_EXTENSIONS.includes(lastExt)) {
      return { valid: false, error: `Suspicious file name detected: "${fileName}"` };
    }
  }

  return { valid: true };
}

async function fetchMediaAsBlob(urlOrBase64: string): Promise<{ blob: Blob; filename: string } | null> {
  try {
    if (urlOrBase64.startsWith("data:")) {
      const match = urlOrBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return null;
      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");
      
      let ext = ".bin";
      if (mimeType.includes("jpeg")) ext = ".jpg";
      else if (mimeType.includes("png")) ext = ".png";
      else if (mimeType.includes("webp")) ext = ".webp";
      else if (mimeType.includes("mp4")) ext = ".mp4";
      else if (mimeType.includes("gif")) ext = ".gif";

      const blob = new Blob([buffer], { type: mimeType });
      return { blob, filename: `upload-${Date.now()}${ext}` };
    } else if (urlOrBase64.startsWith("http")) {
      const res = await fetch(urlOrBase64, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
      });
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const mimeType = res.headers.get("content-type") || "application/octet-stream";
      
      let ext = ".bin";
      if (mimeType.includes("jpeg")) ext = ".jpg";
      else if (mimeType.includes("png")) ext = ".png";
      else if (mimeType.includes("webp")) ext = ".webp";
      else if (mimeType.includes("mp4")) ext = ".mp4";
      else if (mimeType.includes("gif")) ext = ".gif";
      else {
        try {
          const urlObj = new URL(urlOrBase64);
          const pathname = urlObj.pathname;
          const parsedExt = path.extname(pathname);
          if (parsedExt) ext = parsedExt;
        } catch {}
      }

      const blob = new Blob([arrayBuffer], { type: mimeType });
      return { blob, filename: `upload-${Date.now()}${ext}` };
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract proxy metadata
    const targetUrl = formData.get("__proxy_url") as string;
    const targetMethod = formData.get("__proxy_method") as string;
    const authHeader = formData.get("__proxy_auth") as string | null;
    const deviceId = formData.get("__proxy_device_id") as string | null;
    const bodyType = formData.get("__proxy_body_type") as string;

    if (!targetUrl || !targetMethod) {
      return NextResponse.json(
        { error: "Missing proxy configuration (__proxy_url, __proxy_method)" },
        { status: 400 }
      );
    }

    // Build headers
    const headers: Record<string, string> = {};
    if (authHeader) headers["Authorization"] = authHeader;
    if (deviceId) headers["X-Device-Id"] = deviceId;

    let response: Response;

    // Detect if we need to upgrade a media URL input to on-the-fly multipart file upload
    let isUrlUpgrade = false;
    let upgradeKey = "";
    let upgradeFileField = "";
    let upgradeUrl = "";

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("__proxy_")) continue;
      if (
        key.endsWith("_url") &&
        typeof value === "string" &&
        (value.startsWith("http") || value.startsWith("data:"))
      ) {
        isUrlUpgrade = true;
        upgradeKey = key;
        upgradeFileField = key.replace("_url", "");
        upgradeUrl = value;
        break;
      }
    }

    if (targetMethod === "GET") {
      // For GET, append params as query string
      const url = new URL(targetUrl);
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("__proxy_")) continue;
        if (typeof value === "string") {
          url.searchParams.set(key, value);
        }
      }
      response = await fetch(url.toString(), { method: "GET", headers });
    } else if (isUrlUpgrade) {
      const media = await fetchMediaAsBlob(upgradeUrl);
      if (media) {
        const outForm = new FormData();
        for (const [key, value] of formData.entries()) {
          if (key.startsWith("__proxy_")) continue;
          if (key === upgradeKey) continue;
          if (typeof value === "string") {
            outForm.append(key, value);
          }
        }

        const validation = validateFile(media.blob, media.filename);
        if (!validation.valid) {
          return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Directly append Blob without disk touching
        outForm.append(upgradeFileField, media.blob, media.filename);

        response = await fetch(targetUrl, {
          method: targetMethod,
          headers,
          body: outForm,
        });
      } else {
        return NextResponse.json(
          {
            error: `Failed to download or parse media from: ${upgradeUrl.substring(0, 100)}${upgradeUrl.length > 100 ? "..." : ""}`,
            hint: "Please ensure the URL is accessible or try uploading the file directly.",
          },
          { status: 400 }
        );
      }
    } else if (bodyType === "json") {
      // JSON body
      const jsonBody: Record<string, unknown> = {};
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("__proxy_")) continue;
        if (typeof value === "string") {
          // Try parsing booleans
          if (value === "true") jsonBody[key] = true;
          else if (value === "false") jsonBody[key] = false;
          else jsonBody[key] = value;
        }
      }
      headers["Content-Type"] = "application/json";
      response = await fetch(targetUrl, {
        method: targetMethod,
        headers,
        body: JSON.stringify(jsonBody),
      });
    } else {
      // Form-data (multipart) - may include files
      const outForm = new FormData();
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("__proxy_")) continue;

        if (value instanceof File && value.size > 0) {
          // Validate the file in-memory
          const validation = validateFile(value, value.name);
          if (!validation.valid) {
            return NextResponse.json(
              { error: validation.error },
              { status: 400 }
            );
          }

          // Pass through directly, no memory creation needed
          outForm.append(key, value, value.name);
        } else if (typeof value === "string") {
          outForm.append(key, value);
        }
      }

      response = await fetch(targetUrl, {
        method: targetMethod,
        headers,
        body: outForm,
      });
    }

    // Parse response
    const contentType = response.headers.get("content-type") || "";
    let body: unknown;
    if (contentType.includes("application/json")) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    return NextResponse.json(
      {
        status: response.status,
        statusText: response.statusText,
        body,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: `Proxy request failed: ${message}`,
        hint: "Make sure your GoWA server is running and the Base URL is correct.",
      },
      { status: 502 }
    );
  }
}
