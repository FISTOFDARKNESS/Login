import { neon } from '@netlify/neon';

const sql = neon();

export async function handler() {
  try {
    const products = await sql`
      SELECT id, name, category, description, image, link
      FROM products
      ORDER BY name
    `;
    return { statusCode: 200, body: JSON.stringify(products) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
