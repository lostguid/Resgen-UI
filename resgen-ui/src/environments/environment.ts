export const environment = {
    production: false,
    apiUrl: 'https://staging.example.com/api',
    auth: {
      domain: 'resgen-ai.us.auth0.com',
      clientId: 'rsY5nSoucGcdP2wPKOSA45KquQIEEY6T',
      audience: 'https://staging.example.com/api',
      redirectUri: 'http://localhost:4200/home',
      logOutUri: 'http://localhost:4200/home',
      scope: 'openid profile email'
    }
  };