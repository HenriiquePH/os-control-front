import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MensagemService {
  texto = signal('');
  visivel = signal(false);
  tipo = signal<'sucesso' | 'erro'>('erro');
  dialogoVisivel = signal(false);
  dialogoTitulo = signal('');
  dialogoTexto = signal('');
  dialogoTipo = signal<'confirmacao' | 'informacao'>('informacao');
  private tempoMensagem?: number;
  private resolverConfirmacao?: (confirmado: boolean) => void;

  mostrarSucesso(texto: string) {
    this.mostrar(texto, 'sucesso');
  }

  mostrarErro(texto: string) {
    this.mostrar(texto, 'erro');
  }

  confirmar(texto: string, titulo = 'Confirmar acao') {
    this.fecharDialogo(false);
    this.dialogoTitulo.set(titulo);
    this.dialogoTexto.set(texto.trim());
    this.dialogoTipo.set('confirmacao');
    this.dialogoVisivel.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolverConfirmacao = resolve;
    });
  }

  informar(texto: string, titulo = 'Aviso') {
    const mensagem = texto.trim();

    if (!mensagem) {
      return;
    }

    this.fecharDialogo(false);
    this.dialogoTitulo.set(titulo);
    this.dialogoTexto.set(mensagem);
    this.dialogoTipo.set('informacao');
    this.dialogoVisivel.set(true);
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

  confirmarDialogo() {
    this.fecharDialogo(true);
  }

  cancelarDialogo() {
    this.fecharDialogo(false);
  }

  private fecharDialogo(confirmado: boolean) {
    const resolver = this.resolverConfirmacao;

    this.resolverConfirmacao = undefined;
    this.dialogoVisivel.set(false);
    this.dialogoTitulo.set('');
    this.dialogoTexto.set('');
    this.dialogoTipo.set('informacao');

    resolver?.(confirmado);
  }
}
