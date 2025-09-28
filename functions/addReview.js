import { neon } from '@neondatabase/serverless';

export async function handler(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { productId, userName, rating, comment } = body;

    if (!productId || !userName || !rating || !comment) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: "All fields are required" })
      };
    }

    // ✅ COLOCA A SUA CONNECTION STRING AQUI DIRETAMENTE
    const connectionString = "postgresql://neondb_owner:npg_mgw4DTLjik8l@ep-autumn-rice-ae1jy1wl-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";
    
    const sql = neon(connectionString);
    
    await sql`
      INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
      VALUES (${parseInt(productId)}, ${userName}, ${parseInt(rating)}, ${comment}, NOW())
    `;

    return { 
      statusCode: 200, 
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true }) 
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
