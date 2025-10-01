const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_mgw4DTLjik8l@ep-holy-darkness-aevwosmo-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { action, userData, googleToken } = JSON.parse(event.body);

    if (action === 'verifyUser') {
      // Verificar token do Google (simplificado - em produção use a biblioteca oficial)
      const userResponse = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${googleToken}`);
      const userInfo = await userResponse.json();
      
      if (!userInfo.email) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
      }

      // Verificar se usuário existe
      const userResult = await pool.query(
        'SELECT * FROM users WHERE google_id = $1 OR email = $2',
        [userInfo.sub, userInfo.email]
      );

      let user;
      if (userResult.rows.length === 0) {
        // Criar novo usuário
        const newUser = await pool.query(
          'INSERT INTO users (google_id, name, email, profile_picture) VALUES ($1, $2, $3, $4) RETURNING *',
          [userInfo.sub, userInfo.name, userInfo.email, userInfo.picture]
        );
        user = newUser.rows[0];
      } else {
        user = userResult.rows[0];
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ user })
      };
    }

    if (action === 'getUserProducts') {
      const { userId } = JSON.parse(event.body);
      
      const products = await pool.query(
        `SELECT p.*, 
                COUNT(r.id) as review_count,
                COALESCE(AVG(r.rating), 0) as avg_rating
         FROM products p 
         LEFT JOIN reviews r ON p.id = r.product_id 
         WHERE p.user_id = $1 
         GROUP BY p.id 
         ORDER BY p.created_at DESC`,
        [userId]
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ products: products.rows })
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
