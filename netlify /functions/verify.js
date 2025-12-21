import crypto from "crypto";

const tokens = global.tokens || (global.tokens = {});

export async function handler(event) {
  const token = event.queryStringParameters?.token;

  if (!token || !tokens[token]) {
    return { statusCode: 403, body: "Acesso negado" };
  }

  if (tokens[token].used) {
    return { statusCode: 403, body: "Token já usado" };
  }

  // expira em 5 minutos
  if (Date.now() - tokens[token].createdAt > 5 * 60 * 1000) {
    return { statusCode: 403, body: "Token expirado" };
  }

  // proteção extra
  const referer = event.headers.referer || "";
  if (!referer.includes("work.ink")) {
    return { statusCode: 403, body: "Bypass detectado" };
  }

  tokens[token].used = true;

  const key = "KEY-" + crypto.randomBytes(8).toString("hex");

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Sua key:\n${key}`
  };
}
