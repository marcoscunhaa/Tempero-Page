import { Component, OnInit } from '@angular/core';
import { Venda, ResumoVendasDTO, VendaService } from '../../services/venda';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificacaoService, Notificacao } from '../../services/notificacao';
import { GraficosComponent } from '../graficos/graficos';

@Component({
  selector: 'app-vendas',
  standalone: true,
  imports: [CommonModule, FormsModule, GraficosComponent],
  templateUrl: './vendas.html',
  styleUrls: ['./vendas.scss'],
})
export class Vendas implements OnInit {
  vendas: Venda[] = [];
  vendasFiltradas: Venda[] = [];
  vendasPaginadas: Venda[] = [];

  paginaAtual = 1;
  itensPorPagina = 15;
  totalPaginas = 1;
  paginasVisiveis: number[] = [];

  resumo: ResumoVendasDTO = {
    totalVendido: 0,
    totalComprado: 0,
    lucroBruto: 0,
    margemLucro: 0,
  };

  categorias: string[] = ['todas', 'carnes', 'temperos', 'bebidas', 'frios', 'doces'];
  categoriaSelecionada: string = 'todas';

  anos: number[] = [];
  anoSelecionado: number | 'todos' = 'todos';

  meses = [
    { nome: 'Janeiro', valor: 0 },
    { nome: 'Fevereiro', valor: 1 },
    { nome: 'Março', valor: 2 },
    { nome: 'Abril', valor: 3 },
    { nome: 'Maio', valor: 4 },
    { nome: 'Junho', valor: 5 },
    { nome: 'Julho', valor: 6 },
    { nome: 'Agosto', valor: 7 },
    { nome: 'Setembro', valor: 8 },
    { nome: 'Outubro', valor: 9 },
    { nome: 'Novembro', valor: 10 },
    { nome: 'Dezembro', valor: 11 },
  ];
  mesSelecionado: number | 'todos' = 'todos';

  dataAtualizacao: string = '';
  alertaMensagem: string | null = null;
  tipoAlerta: 'success' | 'danger' | 'warning' | 'info' = 'success';

  vendaSelecionada: Venda | null = null; // usada no modal de edição/exclusão

  constructor(private vendaService: VendaService, private notificacaoService: NotificacaoService) {}

  ngOnInit() {
    this.setDataAtualizacao();
    this.anos = Array.from({ length: 11 }, (_, i) => 2025 + i);

    this.carregarResumo();
    this.carregarVendas();

    this.notificacaoService.notificacao$.subscribe((notif: Notificacao) => {
      this.alertaMensagem = notif.mensagem;
      this.tipoAlerta = notif.tipo;
      this.carregarVendas();
      this.carregarResumo();
    });
  }

  setDataAtualizacao() {
    const hoje = new Date();
    const opcoes: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    this.dataAtualizacao = hoje.toLocaleDateString('pt-BR', opcoes).toUpperCase();
  }

  carregarVendas() {
    this.vendaService.listarVendas().subscribe({
      next: (lista) => {
        this.vendas = lista;
        this.filtrarVendas();
      },
    });
  }

  carregarResumo() {
    this.vendaService.getResumo().subscribe({
      next: (res) => (this.resumo = res),
    });
  }

  filtrarVendas() {
    this.vendasFiltradas = this.vendas.filter((venda) => {
      const { ano, mes } = parseLocalDate(venda.dataVenda);

      const categoriaOk =
        this.categoriaSelecionada === 'todas' ||
        venda.categoria.toLowerCase() === this.categoriaSelecionada.toLowerCase();

      const anoOk = this.anoSelecionado === 'todos' || ano === this.anoSelecionado;
      const mesOk = this.mesSelecionado === 'todos' || mes === this.mesSelecionado;

      return categoriaOk && anoOk && mesOk;
    });

    this.paginaAtual = 1;
    this.atualizarPaginacao();
  }

  atualizarPaginacao() {
    this.totalPaginas = Math.ceil(this.vendasFiltradas.length / this.itensPorPagina);

    if (this.paginaAtual > this.totalPaginas) this.paginaAtual = this.totalPaginas;
    if (this.paginaAtual < 1) this.paginaAtual = 1;

    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.vendasPaginadas = this.vendasFiltradas.slice(inicio, fim);

    const max = 3;
    let inicioPag = Math.max(1, this.paginaAtual - max);
    let fimPag = Math.min(this.totalPaginas, this.paginaAtual + max);

    const paginas: number[] = [];

    if (inicioPag > 1) paginas.push(1);
    if (inicioPag > 2) paginas.push(-1);

    for (let i = inicioPag; i <= fimPag; i++) paginas.push(i);

    if (fimPag < this.totalPaginas - 1) paginas.push(-1);
    if (fimPag < this.totalPaginas) paginas.push(this.totalPaginas);

    this.paginasVisiveis = paginas;
  }

  irParaPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas || pagina === -1) return;
    this.paginaAtual = pagina;
    this.atualizarPaginacao();
  }

  trackByIndex(index: number) {
    return index;
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarLucro(venda: Venda): string {
    const compra = venda.precoCompra ?? 0;
    const vendaValor = venda.precoVenda ?? 0;
    const quantidade = venda.quantidadeVendida ?? 1;
    const lucro = (vendaValor - compra) * quantidade;
    return this.formatarMoeda(lucro);
  }

  finalizarVenda(novaVenda: Venda) {
    this.vendaService.criarVenda(novaVenda).subscribe({
      next: (vendaSalva) => {
        this.vendas.push(vendaSalva);
        this.filtrarVendas();
        this.carregarResumo();
      },
    });
  }

  // ------------------------------
  // EDITAR VENDA
  // ------------------------------
  editarVenda(venda: Venda) {
    this.vendaSelecionada = { ...venda };

    // Garante que a forma de pagamento seja válida ou define padrão
    const formasValidas = ['Dinheiro', 'Pix', 'Débito', 'Crédito'];
    if (!formasValidas.includes(this.vendaSelecionada.formaPagamento)) {
      this.vendaSelecionada.formaPagamento = 'Dinheiro';
    }

    // Converter data para yyyy-MM-dd se necessário
    if (this.vendaSelecionada.dataVenda.includes('/')) {
      const [d, m, a] = this.vendaSelecionada.dataVenda.split('/');
      this.vendaSelecionada.dataVenda = `${a}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }

  salvarEdicaoVenda() {
    if (!this.vendaSelecionada || !this.vendaSelecionada.id) return;

    this.vendaService.atualizarVenda(this.vendaSelecionada.id, this.vendaSelecionada).subscribe({
      next: (vendaAtualizada) => {
        this.notificacaoService.emitirSucesso('Venda atualizada com sucesso!');
        const index = this.vendas.findIndex((v) => v.id === vendaAtualizada.id);
        if (index !== -1) this.vendas[index] = vendaAtualizada;
        this.filtrarVendas();
      },
    });
  }

  // Getter para lucro da venda selecionada no modal
  get lucroVendaSelecionada(): string {
    if (!this.vendaSelecionada) return this.formatarMoeda(0);
    const compra = this.vendaSelecionada.precoCompra ?? 0;
    const venda = this.vendaSelecionada.precoVenda ?? 0;
    const qtd = this.vendaSelecionada.quantidadeVendida ?? 1;
    const lucro = (venda - compra) * qtd;
    return this.formatarMoeda(lucro);
  }

  // ------------------------------
  // DELETAR VENDA
  // ------------------------------
  abrirModalExcluir(venda: Venda) {
    this.vendaSelecionada = venda;
  }

  confirmarExcluirVenda() {
    if (!this.vendaSelecionada || !this.vendaSelecionada.id) return;

    this.vendaService.deletarVenda(this.vendaSelecionada.id).subscribe({
      next: () => {
        this.vendas = this.vendas.filter((v) => v.id !== this.vendaSelecionada!.id);
        this.filtrarVendas();
        this.carregarResumo();
        this.notificacaoService.emitirSucesso('Venda excluída com sucesso!');
      },
    });
  }
}

// ------------------------------
// FUNÇÃO AUXILIAR PARA PARSE DE DATAS
// ------------------------------
function parseLocalDate(dataVenda: string): { ano: number; mes: number; dia: number } {
  if (!dataVenda) return { ano: 0, mes: 0, dia: 0 };

  if (dataVenda.includes('T')) {
    const d = new Date(dataVenda);
    return { ano: d.getFullYear(), mes: d.getMonth(), dia: d.getDate() };
  }

  if (dataVenda.includes('/')) {
    const [diaStr, mesStr, anoStr] = dataVenda.split('/');
    return {
      ano: Number(anoStr),
      mes: Number(mesStr) - 1,
      dia: Number(diaStr),
    };
  }

  const [ano, mes, dia] = dataVenda.split('-').map(Number);
  return { ano, mes: mes - 1, dia };
}
