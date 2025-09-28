import { neon } from '@neondatabase/serverless';

export async function handler(event, context) {
  // Handle CORS
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

    // ✅ COLOCA A SUA CONNECTION STRING AQUI DIRETAMENTE
    const connectionString = "postgresql://neondb_owner:npg_mgw4DTLjik8l@ep-holy-darkness-aevwosmo-pooler.c-2.us-east-2.aws.neon.tech/Checkpoint?sslmode=require&channel_binding=require";
    
    const sql = neon(connectionString);
    
    const reviews = await sql`
      SELECT user_name, rating, comment, created_at
      FROM reviews
      WHERE product_id = ${parseInt(productId)}
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
      body: JSON.stringify({ 
        error: "Internal server error",
        message: err.message 
      }) 
    };
  }
}

