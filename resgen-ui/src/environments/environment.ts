export const environment = {
    production: true,
    apiUrl: 'http://localhost:5039/api',
    auth: {
      domain: 'resgen-ai.us.auth0.com',
      clientId: 'rsY5nSoucGcdP2wPKOSA45KquQIEEY6T',
      audience: 'https://resgen-ai.us.auth0.com/api/v2/',
      redirectUri: 'http://localhost:4200/',
      logOutUri: 'http://localhost:4200/',
      scope: 'openid profile email'
    }
  };