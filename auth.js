const propelAuth = require('@propelauth/express');

module.exports = propelAuth.initAuth({    
    authUrl: process.env.PROPELAUTH_AUTH_URL,
    apiKey: process.env.PROPELAUTH_API_KEY,
})