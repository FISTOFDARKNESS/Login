import { neon } from '@neondatabase/serverless';

export async function handler(event, context) {

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { productId } = event.queryStringParameters;

    if (!productId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: "productId is required" })
      };
    }

    const sql = neon(process.env.DATABASE_URL);
    
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
    console.error("Database error:", err);
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
