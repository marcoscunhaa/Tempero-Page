import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// MODELOS
export interface Venda {
  id?: number;
  dataVenda: string;
  categoria: string;
  produto: string;
  marca: string;
  precoCompra?: number;
  precoVenda: number;
  quantidadeVendida: number;
  formaPagamento: string;
  lucro?: number;
}

export interface ResumoVendasDTO {
  totalVendido: number;
  totalComprado: number;
  lucroBruto: number;
  margemLucro: number;
}

@Injectable({
  providedIn: 'root',
})
export class VendaService {

  private readonly apiUrl = 'http://localhost:8080/vendas';

  constructor(private http: HttpClient) {}

  // =============================
  // LISTAR TODAS AS VENDAS
  // =============================
  listarVendas(): Observable<Venda[]> {
    return this.http.get<Venda[]>(this.apiUrl);
  }

  // =============================
  // CRIAR VENDA
  // =============================
  criarVenda(venda: Venda): Observable<Venda> {
    return this.http.post<Venda>(this.apiUrl, venda);
  }

  // =============================
  // ATUALIZAR VENDA (PUT)
  // =============================
  atualizarVenda(id: number, venda: Venda): Observable<Venda> {
    return this.http.put<Venda>(`${this.apiUrl}/${id}`, venda);
  }

  // =============================
  // DELETAR VENDA
  // =============================
  deletarVenda(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // =============================
  // RESUMO DAS VENDAS
  // =============================
  getResumo(): Observable<ResumoVendasDTO> {
    return this.http.get<ResumoVendasDTO>(`${this.apiUrl}/resumo`);
  }
}
