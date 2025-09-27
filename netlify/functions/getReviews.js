import { neon } from '@netlify/neon';
const sql = neon();

export async function handler(event) {
  try {
    const { id } = event.queryStringParameters;

    const reviews = await sql`
      SELECT * FROM reviews WHERE product_id = ${id} ORDER BY created_at DESC
    `;

    return { statusCode: 200, body: JSON.stringify(reviews) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
