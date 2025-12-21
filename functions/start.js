import crypto from "crypto";

const tokens = global.tokens || (global.tokens = {});

export async function handler() {
  const token = crypto.randomUUID();

  tokens[token] = {
    used: false,
    createdAt: Date.now()
  };

  const redirectUrl =
    "https://redirect-api.work.ink/token" +
    "?destination=" +
    encodeURIComponent(`https://triangulogiveways.netlify.app/.netlify/functions/verify?token=${token}`);

  return {
    statusCode: 302,
    headers: {
      Location: redirectUrl
    }
  };
}
//test
