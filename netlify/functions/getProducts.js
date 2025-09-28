import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export const handler = async (event, context) => {
  try {
    const products = await sql`
      SELECT id, name, category, description, image, link
      FROM products
      ORDER BY name
    `;

    return {
      statusCode: 200,
      body: JSON.stringify(products),
    };
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};