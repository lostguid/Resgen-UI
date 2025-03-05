export const environment = {
    production: true,
    apiUrl: 'https://staging.example.com/api',
    auth: {
      domain: 'resgen-ai.us.auth0.com',
      clientId: 'rsY5nSoucGcdP2wPKOSA45KquQIEEY6T',
      audience: 'https://resgen-ai.us.auth0.com/api/v2/',
      redirectUri: 'http://localhost:4200/home',
      logOutUri: 'http://localhost:4200/home',
      scope: 'openid profile email'
    }
  };