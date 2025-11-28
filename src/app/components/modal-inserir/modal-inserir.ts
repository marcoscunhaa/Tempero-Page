import { Component, OnInit } from '@angular/core';
import { ProdutoService, Produto } from '../../services/produto';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificacaoService, TipoAlerta, Notificacao } from '../../services/notificacao';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-modal-inserir',
  templateUrl: './modal-inserir.html',
  styleUrls: ['./modal-inserir.scss'],
})
export class ModalInserir implements OnInit {
  loading = false;
  produtoForm: FormGroup;
  produtosExistentes: Produto[] = [];

  alertaMensagem: string | null = null;
  tipoAlerta: TipoAlerta = 'success';

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private notificacaoService: NotificacaoService
  ) {
    this.produtoForm = this.fb.group({
      categoria: ['', Validators.required],
      detalhe: ['', Validators.required],
      marca: ['', Validators.required],
      precoCompra: [null, [Validators.required, Validators.min(0.01)]],
      precoVenda: [null, [Validators.required, Validators.min(0.01)]],
      quantidadeEstoque: [null, [Validators.required, Validators.min(1)]],
      vencimento: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.notificacaoService.notificacao$.subscribe((notif: Notificacao) => {
      this.alertaMensagem = notif.mensagem;
      this.tipoAlerta = notif.tipo;
    });

    // Carrega produtos existentes para validação
    this.produtoService.listarTodos().subscribe({
      next: (prods) => this.produtosExistentes = prods,
      error: () => this.produtosExistentes = []
    });
  }

  adicionarProduto() {
    if (this.produtoForm.invalid) {
      this.notificacaoService.emitirAviso('Preencha todos os campos corretamente!');
      return;
    }

    const novoProduto: Produto = this.produtoForm.value;

    // Validação no frontend: verifica se já existe detalhe igual
    const existeDetalhe = this.produtosExistentes.some(
      p => p.detalhe.trim().toLowerCase() === novoProduto.detalhe.trim().toLowerCase()
    );

    if (existeDetalhe) {
      this.notificacaoService.emitirErro('Já existe um produto com essa descrição!');
      return;
    }

    this.loading = true;

    this.produtoService.salvar(novoProduto)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.produtoForm.reset();
          this.notificacaoService.emitirSucesso('Produto salvo com sucesso!');
          this.produtoService.listarTodos().subscribe(prods => this.produtosExistentes = prods);
        },
        error: () => {
          this.notificacaoService.emitirErro('Erro ao salvar o produto.');
        }
      });
  }
}
