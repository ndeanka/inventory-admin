import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/** Attaches HTTP Basic credentials for inventory-api. */
export const basicAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = btoa(`${environment.apiUsername}:${environment.apiPassword}`);
  return next(
    req.clone({
      setHeaders: {
        Authorization: `Basic ${token}`,
      },
    }),
  );
};
