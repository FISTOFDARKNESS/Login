const fetch = require('node-fetch');

exports.handler = async (event) => {

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { token } = JSON.parse(event.body);
    
    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Token is required' })
      };
    }

    const secretKey = '6LdvNN8rAAAAACsHw91wyveLBTQYnFqeqkHsOFTZ';
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;
    
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`
    });
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
