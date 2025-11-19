import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type TipoAlerta = 'success' | 'danger' | 'warning' | 'info';

export interface Notificacao {
  mensagem: string;
  tipo: TipoAlerta;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {

  private _notificacao = new Subject<Notificacao>();
  notificacao$ = this._notificacao.asObservable();

  emitirSucesso(mensagem: string) {
    this._notificacao.next({ mensagem, tipo: 'success' });
  }

  emitirErro(mensagem: string) {
    this._notificacao.next({ mensagem, tipo: 'danger' });
  }

  emitirAviso(mensagem: string) {
    this._notificacao.next({ mensagem, tipo: 'warning' });
  }

  emitirInfo(mensagem: string) {
    this._notificacao.next({ mensagem, tipo: 'info' });
  }
}
