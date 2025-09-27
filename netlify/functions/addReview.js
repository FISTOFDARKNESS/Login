import { neon } from '@netlify/neon';

const sql = neon();

export async function handler(event) {
  try {
    const { productId, userName, rating, comment } = JSON.parse(event.body);

    await sql`
      INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
      VALUES (${productId}, ${userName}, ${rating}, ${comment}, NOW())
    `;

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
