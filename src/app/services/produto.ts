import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// INTERFACE fora da classe ✔
export interface Produto {
  id?: number;
  categoria: string;
  detalhe: string;
  marca: string;
  precoCompra: number;
  precoVenda: number;
  quantidadeEstoque: number;
  vencimento: string; // ou Date
}

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {

  private readonly apiUrl = 'http://localhost:8080/produtos';

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/${id}`);
  }

  buscarPorCategoria(categoria: string): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/categoria/${categoria}`);
  }

  pesquisar(termo: string): Observable<Produto[]> {
    const params = new HttpParams().set('q', termo);
    return this.http.get<Produto[]>(`${this.apiUrl}/pesquisar`, { params });
  }

  salvar(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, produto);
  }

  atualizar(id: number, produto: Produto): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/${id}`, produto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
