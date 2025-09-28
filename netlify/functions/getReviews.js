import { neon } from '@netlify/neon';

const sql = neon();

export async function handler(event) {
  try {
    const { productId } = event.queryStringParameters;

    const reviews = await sql`
      SELECT user_name, rating, comment, created_at
      FROM reviews
      WHERE product_id = ${productId}
      ORDER BY created_at DESC
    `;

    return {
      statusCode: 200,
      body: JSON.stringify(reviews),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
