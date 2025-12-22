export async function handler(event) {

  // BLOQUEIA LINK DIRETO
  const referer = event.headers.referer || "";
  if (!referer.includes("work.ink")) {
    return {
      statusCode: 403,
      body: "Bypass detectado"
    };
  }

  // GERA KEY
  const key =
    "KEY-" +
    Math.random().toString(36).substring(2, 10).toUpperCase();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain"
    },
    body: `SUA KEY:\n\n${key}`
  };
}
