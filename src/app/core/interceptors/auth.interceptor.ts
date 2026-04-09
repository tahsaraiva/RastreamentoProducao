import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRoute =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/refresh') ||
        req.url.includes('/auth/logout');

      if (error.status !== 401 || isAuthRoute) {
        return throwError(() => error);
      }

      return from(auth.tryRefresh()).pipe(
        switchMap((success) => {
          if (!success) {
            void auth.logout(false);
            return throwError(() => error);
          }

          const newToken = auth.token();

          const retryReq = newToken
            ? req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              })
            : req;

          return next(retryReq);
        })
      );
    })
  );
};