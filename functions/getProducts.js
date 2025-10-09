Qimport { neon } from '@neondatabase/serverless';

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
    const connectionString = "postgresql://neondb_owner:npg_mgw4DTLjik8l@ep-holy-darkness-aevwosmo-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";
    
    const sql = neon(connectionString);
    
    const products = await sql`
      SELECT id, name, category, description, image, link
      FROM products
      ORDER BY id
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(products)
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



