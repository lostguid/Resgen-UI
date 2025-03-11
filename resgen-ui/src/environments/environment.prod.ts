export const environment = {
  production: false,
  apiUrl: 'https://api-resgen-enfjdbamcyedehf3.eastus2-01.azurewebsites.net/api',
  auth: {
    domain: 'resgen-ai.us.auth0.com',
    clientId: 'vcxOOz5DWFxImTeN2ToQZPojV8YUBqK9',
    audience: 'https://resgen-ai.us.auth0.com/api/v2/',
    redirectUri: 'https://delightful-desert-0db1b370f.6.azurestaticapps.net/',
    logOutUri: 'https://delightful-desert-0db1b370f.6.azurestaticapps.net/',
    scope: 'openid profile email'
  }
};