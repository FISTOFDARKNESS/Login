import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function handler(event) {
  try {
    const { productId } = event.queryStringParameters;

    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "productId is required" })
      };
    }

    const reviews = await sql`
      SELECT user_name, rating, comment, created_at
      FROM reviews
      WHERE product_id = ${productId}
      ORDER BY created_at DESC
    `;

    return { 
      statusCode: 200, 
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(reviews) 
    };
  } catch (err) {
    return { 
      statusCode: 500, 
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: err.message }) 
    };
  }
}