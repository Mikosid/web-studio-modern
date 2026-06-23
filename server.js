import { createServer } from "node:http";
import { appendFile, mkdir, readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const ROOT_DIR = process.cwd();

await loadEnvFile();

const PORT = Number(process.env.PORT || 3000);
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const DATA_DIR = resolve(ROOT_DIR, process.env.DATA_DIR || "data");
const REQUESTS_DB = join(DATA_DIR, "requests.jsonl");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function loadEnvFile() {
  try {
    const envFile = await readFile(join(ROOT_DIR, ".env"), "utf8");

    envFile.split(/\r?\n/).forEach((line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) return;

      const separatorIndex = trimmedLine.indexOf("=");
      if (separatorIndex === -1) return;

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
  } catch {
    // The .env file is optional. Production hosts can provide environment variables directly.
  }
}

createServer(async (request, response) => {
  try {
    if (request.method === "POST" && request.url === "/api/requests") {
      await handleCreateRequest(request, response);
      return;
    }

    if (request.method === "GET" || request.method === "HEAD") {
      await serveStaticFile(request, response);
      return;
    }

    sendJson(response, 405, { message: "Method not allowed" });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { message: "Internal server error" });
  }
}).listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

async function handleCreateRequest(request, response) {
  const body = await readJsonBody(request);
  const contactRequest = normalizeContactRequest(body);
  const validationErrors = validateContactRequest(contactRequest);

  if (validationErrors.length > 0) {
    sendJson(response, 400, {
      message: "Please check the form fields.",
      errors: validationErrors,
    });
    return;
  }

  const savedRequest = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...contactRequest,
  };

  await saveRequest(savedRequest);

  const telegramResult = await sendTelegramNotification(savedRequest);
  const status = telegramResult.ok ? 201 : 202;

  sendJson(response, status, {
    message: telegramResult.ok
      ? "Request saved and Telegram notification sent."
      : "Request saved, but Telegram notification was not sent. Check server settings.",
    requestId: savedRequest.id,
    telegramSent: telegramResult.ok,
  });
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);

    if (Buffer.concat(chunks).length > 1024 * 1024) {
      throw new Error("Request body is too large");
    }
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function normalizeContactRequest(body) {
  return {
    name: String(body.name || "").trim(),
    phone: String(body.phone || "").trim(),
    email: String(body.email || "").trim(),
    comment: String(body.comment || "").trim(),
    privacyAccepted: Boolean(body.privacyAccepted),
  };
}

function validateContactRequest(contactRequest) {
  const errors = [];

  if (contactRequest.name.length < 2)
    errors.push("Name must contain at least 2 characters.");
  if (contactRequest.phone.length < 5)
    errors.push("Phone must contain at least 5 characters.");
  if (!/^\S+@\S+\.\S+$/.test(contactRequest.email))
    errors.push("Email address is invalid.");
  if (!contactRequest.privacyAccepted)
    errors.push("Privacy policy must be accepted.");

  return errors;
}

async function saveRequest(contactRequest) {
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(REQUESTS_DB, `${JSON.stringify(contactRequest)}\n`, "utf8");
}

async function sendTelegramNotification(contactRequest) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { ok: false };
  }

  const message = [
    "🆕 New Web Studio request",
    `ID: ${contactRequest.id}`,
    `Name: ${contactRequest.name}`,
    `Phone: ${contactRequest.phone}`,
    `Email: ${contactRequest.email}`,
    `Comment: ${contactRequest.comment || "—"}`,
    `Created: ${contactRequest.createdAt}`,
  ].join("\n");

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
      },
    );

    return { ok: telegramResponse.ok };
  } catch (error) {
    console.error("Telegram notification failed:", error);
    return { ok: false };
  }
}

async function serveStaticFile(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = normalize(decodeURIComponent(pathname)).replace(
    /^(\.\.[/\\])+/,
    "",
  );
  const filePath = resolve(ROOT_DIR, `.${safePath}`);

  if (!filePath.startsWith(ROOT_DIR) || filePath.startsWith(DATA_DIR)) {
    sendJson(response, 403, { message: "Forbidden" });
    return;
  }

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) throw new Error("Not a file");

    response.writeHead(200, {
      "Content-Type":
        mimeTypes[extname(filePath)] || "application/octet-stream",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch {
    const notFoundPage = await readFile(join(ROOT_DIR, "index.html"), "utf8");
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(notFoundPage);
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}
