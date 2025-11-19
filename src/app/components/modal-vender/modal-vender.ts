import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NotificacaoService } from '../../services/notificacao';
import { Produto, ProdutoService } from '../../services/produto';
import { Venda, VendaService } from '../../services/venda';
import { forkJoin } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-modal-vender',
  templateUrl: './modal-vender.html',
  styleUrls: ['./modal-vender.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ModalVender {

  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  vendas: Venda[] = [];

  total = 0;
  loading = false;

  formVenda!: FormGroup;

  constructor(
    private produtoService: ProdutoService,
    private vendaService: VendaService,
    private notificacaoService: NotificacaoService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.formVenda = this.fb.group({
      formaPagamento: ['dinheiro', Validators.required],
      produtos: this.fb.array<FormGroup>([]),
    });

    this.carregarProdutos();
  }

  get produtosFormArray(): FormArray<FormGroup> {
    return this.formVenda.get('produtos') as FormArray<FormGroup>;
  }

  carregarProdutos() {
    this.loading = true;

    this.produtoService.listarTodos().subscribe({
      next: (lista: Produto[]) => {
        this.produtos = lista;
        this.produtosFiltrados = [...lista];

        this.produtosFormArray.clear();

        lista.forEach((p) => {
          this.produtosFormArray.push(
            this.fb.group({
              id: [p.id],
              detalhe: [p.detalhe],
              marca: [p.marca],
              categoria: [p.categoria],
              precoCompra: [p.precoCompra],
              precoVenda: [p.precoVenda],
              quantidadeEstoque: [p.quantidadeEstoque],
              selecionado: [false],
              quantidadeVenda: [1, [Validators.required, Validators.min(1)]],
            })
          );
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  filtrar(event: any) {
    const termo = event.target.value.toLowerCase();

    this.produtosFiltrados = this.produtos.filter(
      (p) =>
        p.detalhe.toLowerCase().includes(termo) ||
        p.marca.toLowerCase().includes(termo)
    );
  }

  atualizarTotal() {
    this.total = this.produtosFormArray.controls
      .filter((c) => c.value.selecionado)
      .reduce(
        (soma, c) => soma + c.value.precoVenda * c.value.quantidadeVenda,
        0
      );
  }

  finalizarVenda() {
    const selecionados = this.produtosFormArray.controls
      .filter((c) => c.value.selecionado)
      .map((c) => c.value);

    if (selecionados.length === 0) {
      this.notificacaoService.emitirAviso('Selecione ao menos um produto.');
      return;
    }

    // Verifica estoque
    const produtoSemEstoque = selecionados.find(
      (p) => p.quantidadeEstoque === 0
    );

    if (produtoSemEstoque) {
      this.notificacaoService.emitirErro(
        `O produto "${produtoSemEstoque.detalhe}" está sem estoque!`
      );
      return;
    }

    this.loading = true;

    const requests = selecionados.map((p) => {
      const venda: Venda = {
        dataVenda: new Date().toISOString().split('T')[0],
        categoria: p.categoria,
        produto: p.detalhe,
        marca: p.marca,
        precoCompra: p.precoCompra,
        precoVenda: p.precoVenda,
        formaPagamento: this.formVenda.value.formaPagamento,
        quantidadeVendida: p.quantidadeVenda,
      };

      return this.vendaService.criarVenda(venda);
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.notificacaoService.emitirSucesso('Venda registrada com sucesso!');
        this.carregarProdutos();
        this.carregarVendas();
        this.atualizarTotal();
        this.produtosFormArray.controls.forEach((c) =>
          c.patchValue({ selecionado: false, quantidadeVenda: 1 })
        );
      },
      error: () => {
        this.notificacaoService.emitirErro('Venda não foi realizada!');
      },
      complete: () => (this.loading = false),
    });
  }

  carregarVendas() {
    this.vendaService.listarVendas().subscribe({
      next: (lista) => (this.vendas = lista),
      error: (err) => console.error(err),
    });
  }
}
