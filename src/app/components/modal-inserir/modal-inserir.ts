import { Component } from '@angular/core';
import { ProdutoService, Produto } from '../../services/produto';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificacaoService, TipoAlerta, Notificacao } from '../../services/notificacao';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-modal-inserir',
  templateUrl: './modal-inserir.html',
  styleUrls: ['./modal-inserir.scss'],
})
export class ModalInserir {
  loading = false;
  produtoForm: FormGroup;

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
    // Recebe qualquer notificação (sucesso, erro, warning, info)
    this.notificacaoService.notificacao$.subscribe((notif: Notificacao) => {
      this.alertaMensagem = notif.mensagem;
      this.tipoAlerta = notif.tipo;
    });
  }

  adicionarProduto() {
    if (this.produtoForm.invalid) {
      this.notificacaoService.emitirAviso('Preencha todos os campos corretamente!');
      return;
    }

    const novoProduto: Produto = this.produtoForm.value;
    this.loading = true;

    this.produtoService.salvar(novoProduto).subscribe({
      next: () => {
        this.produtoForm.reset();
        this.notificacaoService.emitirSucesso('Produto salvo com sucesso!');
      },
      error: () => {
        this.notificacaoService.emitirErro('Erro ao salvar o produto.');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
