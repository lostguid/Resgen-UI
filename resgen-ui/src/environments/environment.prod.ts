export const environment = {
  production: false,
  apiUrl: 'http://localhost:5039/api',
  auth: {
    domain: 'resgen-ai.us.auth0.com',
    clientId: 'vcxOOz5DWFxImTeN2ToQZPojV8YUBqK9',
    audience: 'https://resgen-ai.us.auth0.com/api/v2/',
    redirectUri: 'https://delightful-desert-0db1b370f.6.azurestaticapps.net/welcome',
    logOutUri: 'https://delightful-desert-0db1b370f.6.azurestaticapps.net/home',
    scope: 'openid profile email'
  }
};