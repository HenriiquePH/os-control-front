import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

const ROTAS_PUBLICAS = ['/auth/login'];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const rotaPublica = ROTAS_PUBLICAS.some((rota) => request.url.includes(rota));

  if (rotaPublica || request.headers.has('Authorization')) {
    return next(request);
  }

  const token = inject(AuthService).obterToken();

  if (!token) {
    return next(request);
  }

  const requestAutenticada = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(requestAutenticada);
};
