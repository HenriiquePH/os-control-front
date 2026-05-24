import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MensagemService {
  texto = signal('');
  visivel = signal(false);
  tipo = signal<'sucesso' | 'erro'>('erro');
  private tempoMensagem?: number;

  mostrarSucesso(texto: string) {
    this.mostrar(texto, 'sucesso');
  }

  mostrarErro(texto: string) {
    this.mostrar(texto, 'erro');
  }

  private mostrar(texto: string, tipo: 'sucesso' | 'erro') {
    const mensagem = texto.trim();

    if (!mensagem) {
      return;
    }

    this.texto.set(mensagem);
    this.tipo.set(tipo);
    this.visivel.set(true);

    if (this.tempoMensagem) {
      window.clearTimeout(this.tempoMensagem);
    }

    this.tempoMensagem = window.setTimeout(() => {
      this.fechar();
    }, 4000);
  }

  fechar() {
    this.visivel.set(false);
  }
}
