import { Component, OnInit } from '@angular/core';
import { Venda, ResumoVendasDTO, VendaService } from '../../services/venda';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificacaoService, Notificacao } from '../../services/notificacao';

@Component({
  selector: 'app-vendas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendas.html',
  styleUrls: ['./vendas.scss'],
})
export class Vendas implements OnInit {
  vendas: Venda[] = [];
  vendasFiltradas: Venda[] = [];
  resumo: ResumoVendasDTO = {
    totalVendido: 0,
    totalComprado: 0,
    lucroBruto: 0,
    margemLucro: 0,
  };

  categorias: string[] = ['todas', 'carnes', 'temperos', 'bebidas', 'frios', 'doces'];
  categoriaSelecionada: string = 'todas';

  filtroTempo: 'diario' | 'semanal' | 'mensal' = 'diario';

  dataAtualizacao: string = '';

  alertaMensagem: string | null = null;
  tipoAlerta: 'success' | 'danger' | 'warning' | 'info' = 'success';

  constructor(private vendaService: VendaService, private notificacaoService: NotificacaoService) {}

  ngOnInit() {
    this.setDataAtualizacao();
    this.carregarResumo();
    this.carregarVendas();

    this.notificacaoService.notificacao$.subscribe((notif: Notificacao) => {
      this.alertaMensagem = notif.mensagem;
      this.tipoAlerta = notif.tipo;
      this.carregarVendas();
      this.carregarResumo();
    });
  }

  // Define mês/ano para exibição
  setDataAtualizacao() {
    const hoje = new Date();
    const opcoes: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    this.dataAtualizacao = hoje.toLocaleDateString('pt-BR', opcoes).toUpperCase();
  }

  // Carrega todas as vendas
  carregarVendas() {
    this.vendaService.listarVendas().subscribe({
      next: (lista) => {
        this.vendas = lista;
        this.filtrarVendas();
      },
    });
  }

  // Carrega resumo de vendas
  carregarResumo() {
    this.vendaService.getResumo().subscribe({
      next: (res) => (this.resumo = res),
      error: (err) => console.error('Erro ao carregar resumo:', err),
    });
  }

  // FILTRA POR CATEGORIA
  filtrarCategoria(categoria: string) {
    this.categoriaSelecionada = categoria;
    this.filtrarVendas();
  }

  // FILTRA POR TEMPO
  filtrarTempo(filtro: 'diario' | 'semanal' | 'mensal') {
    this.filtroTempo = filtro;
    this.filtrarVendas();
  }

  // FILTROS DA TABELA
  filtrarVendas() {
    const hoje = new Date();
    const anoHoje = hoje.getFullYear();
    const mesHoje = hoje.getMonth();
    const diaHoje = hoje.getDate();

    this.vendasFiltradas = this.vendas.filter((venda) => {
      const { ano, mes, dia } = parseLocalDate(venda.dataVenda);

      const categoriaOk =
        this.categoriaSelecionada === 'todas' ||
        venda.categoria.toLowerCase() === this.categoriaSelecionada.toLowerCase();

      let tempoOk = true;

      if (this.filtroTempo === 'diario') {
        tempoOk = ano === anoHoje && mes === mesHoje && dia === diaHoje;
      } else if (this.filtroTempo === 'semanal') {
        const dataVenda = new Date(ano, mes, dia);
        const hojeDia = new Date(anoHoje, mesHoje, diaHoje);

        const primeiro = new Date(hojeDia);
        primeiro.setDate(hojeDia.getDate() - hojeDia.getDay());

        const ultimo = new Date(primeiro);
        ultimo.setDate(primeiro.getDate() + 6);

        tempoOk = dataVenda >= primeiro && dataVenda <= ultimo;
      } else if (this.filtroTempo === 'mensal') {
        tempoOk = ano === anoHoje && mes === mesHoje;
      }

      return categoriaOk && tempoOk;
    });
  }

  // Formata valor em moeda brasileira
  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Calcula lucro corretamente
  formatarLucro(venda: Venda): string {
    const compra = venda.precoCompra ?? 0;
    const vendaValor = venda.precoVenda ?? 0;
    const quantidade = venda.quantidadeVendida ?? 1;

    const lucro = (vendaValor - compra) * quantidade;

    return this.formatarMoeda(lucro);
  }

  // Quando uma venda for finalizada em outro modal
  finalizarVenda(novaVenda: Venda) {
    this.vendaService.criarVenda(novaVenda).subscribe({
      next: (vendaSalva) => {
        this.vendas.push(vendaSalva);
        this.filtrarVendas();
        this.carregarResumo();
      },
      error: (err) => console.error('Erro ao finalizar venda:', err),
    });
  }
}

// Função para converter 'YYYY-MM-DD'
function parseLocalDate(dataVenda: string): { ano: number; mes: number; dia: number } {
  const [anoStr, mesStr, diaStr] = dataVenda.split('-');
  return {
    ano: Number(anoStr),
    mes: Number(mesStr) - 1,
    dia: Number(diaStr),
  };
}
