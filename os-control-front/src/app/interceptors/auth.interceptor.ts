import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MensagemService } from '../services/mensagem.service';

const ROTAS_PUBLICAS = ['/auth/login'];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const rotaPublica = ROTAS_PUBLICAS.some((rota) => request.url.includes(rota));
  const mensagemService = inject(MensagemService);

  if (rotaPublica || request.headers.has('Authorization')) {
    return next(request).pipe(
      catchError((erro) => {
        mostrarMensagemErro(erro, mensagemService);
        return throwError(() => erro);
      })
    );
  }

  const token = inject(AuthService).obterToken();

  if (!token) {
    return next(request).pipe(
      catchError((erro) => {
        mostrarMensagemErro(erro, mensagemService);
        return throwError(() => erro);
      })
    );
  }

  const requestAutenticada = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(requestAutenticada).pipe(
    catchError((erro) => {
      mostrarMensagemErro(erro, mensagemService);
      return throwError(() => erro);
    })
  );
};

function mostrarMensagemErro(erro: unknown, mensagemService: MensagemService) {
  if (!(erro instanceof HttpErrorResponse)) {
    return;
  }

  if (typeof erro.error === 'string' && erro.error.trim()) {
    mensagemService.mostrarErro(erro.error);
    return;
  }

  if (erro.error?.message?.trim()) {
    mensagemService.mostrarErro(erro.error.message);
    return;
  }

  if (erro.error?.error?.trim()) {
    mensagemService.mostrarErro(erro.error.error);
    return;
  }

  if (erro.status === 0) {
    mensagemService.mostrarErro('Nao foi possivel conectar com o backend.');
    return;
  }

  if (erro.message?.trim()) {
    mensagemService.mostrarErro(erro.message);
  }
}
