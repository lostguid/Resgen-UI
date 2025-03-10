import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const Auth0HttpInerceptorFnService: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Get the authentication token (e.g., from a service or local storage)
  const authToken = localStorage.getItem('user.auth0.token');

  // If there's a token, clone the request and add the Authorization header
  if (authToken) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });
    return next(authReq);
  }
  // If there's no token, just pass the original request
  return next(req);
};
