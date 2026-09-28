import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const mensaje =
        error.error?.message ||
        error.error?.error ||
        error.message ||
        'Error desconocido';

      return throwError(() => ({
        status: error.status,
        message: mensaje
      }));
    })
  );
};