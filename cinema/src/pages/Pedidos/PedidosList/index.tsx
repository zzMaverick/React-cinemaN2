import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {pedidoService} from '../../../services/pedidoService';
import {ingressoService} from '../../../services/ingressoService';
import type {Pedido} from '../../../models/Pedido';
import type {Ingresso} from '../../../models/Ingresso';
import {sessaoService} from '../../../services/sessaoService';
import type {SessaoCompleta} from '../../../models/Sessao';
import {VenderIngressoModal} from '../../Sessoes/VenderIngressoModal';

export const PedidosList = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [ingressosSemPedido, setIngressosSemPedido] = useState<Ingresso[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
    const [selectedSessao, setSelectedSessao] = useState<SessaoCompleta | null>(null);
    const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		loadPedidos();
	}, []);

    const loadPedidos = async () => {
        try {
            const [pedidosData, ingressosData] = await Promise.all([
                pedidoService.getAll(),
                ingressoService.getAll(),
            ]);
            
            setPedidos(pedidosData);
            
            const ingressosEmPedidos = new Set<string>();
            pedidosData.forEach(pedido => {
                pedido.ingresso?.forEach(ing => {
                    if (ing.id) ingressosEmPedidos.add(String(ing.id));
                });
            });
            
            const ingressosSemAssociacao = ingressosData.filter(ing => !ingressosEmPedidos.has(String(ing.id)));
            setIngressosSemPedido(ingressosSemAssociacao);
        } catch (error: any) {
            console.error('Erro ao carregar pedidos:', error);
			if (error.request) {
				alert('Erro: Não foi possível conectar ao servidor. Verifique se o json-server está rodando na porta 3000.');
			} else {
				alert('Erro ao carregar pedidos. Tente novamente.');
			}
		} finally {
			setLoading(false);
		}
    };

    const openEditModal = async (pedido: Pedido) => {
        try {
            const sessaoId = pedido.ingresso?.[0]?.sessaoId;
            if (!sessaoId) {
                alert('Este pedido não possui sessão associada.');
                return;
            }
            const sessoes = await sessaoService.getAll();
            const sessao = sessoes.find(s => String(s.id) === String(sessaoId));
            if (!sessao) {
                alert('Sessão do pedido não encontrada.');
                return;
            }
            setSelectedPedido(pedido);
            setSelectedSessao(sessao);
            setShowModal(true);
        } catch (e) {
            console.error(e);
            alert('Falha ao abrir edição do pedido.');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPedido(null);
        setSelectedSessao(null);
    };

    const handleDelete = async (id: number | string) => {
        if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
            try {
                await pedidoService.delete(id);
                await loadPedidos();
            } catch (error: any) {
                console.error('Erro ao excluir pedido:', error);
                if (error.response) {
                    alert(`Erro: ${error.response.data?.message || 'Erro ao excluir pedido'}`);
                } else if (error.request) {
                    alert('Erro: Não foi possível conectar ao servidor.');
                } else {
                    alert('Erro ao excluir pedido. Tente novamente.');
                }
            }
        }
    };

    const handleAssociarIngresso = async (ingresso: Ingresso) => {
        try {
            const sessoes = await sessaoService.getAll();
            const sessao = sessoes.find(s => String(s.id) === String(ingresso.sessaoId));
            if (!sessao) {
                alert('Sessão do ingresso não encontrada.');
                return;
            }
            
            const novoPedido: Omit<Pedido, 'id' | 'valorTotal'> = {
                ingresso: [ingresso],
                lanche: [],
                qtInteira: ingresso.tipo === 'Inteira' ? 1 : 0,
                qtMeia: ingresso.tipo === 'Meia' ? 1 : 0,
            };
            
            await pedidoService.create(novoPedido);
            await loadPedidos();
            alert('Ingresso associado a um novo pedido com sucesso!');
        } catch (error: any) {
            console.error('Erro ao criar pedido:', error);
            alert('Erro ao associar ingresso a pedido.');
        }
    };

	if (loading) {
		return <div className="text-center mt-5">Carregando...</div>;
	}

    return (
        <div className="container mt-4">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h1>
					<i className="bi bi-cart me-2"></i>
					Pedidos
				</h1>
                <Link to="/combos" className="btn btn-primary">
                    <i className="bi bi-bag me-2"></i>
                    Combos
                </Link>
            </div>

			{pedidos.length === 0 && ingressosSemPedido.length === 0 ? (
				<div className="alert alert-info">
					<i className="bi bi-info-circle me-2"></i>
					Nenhum pedido ou ingresso cadastrado ainda.
				</div>
			) : (
				<div className="row">
					{pedidos.map((pedido) => (
						<div key={pedido.id} className="col-md-6 mb-4">
							<div className="card h-100">
								<div className="card-body">
									<h5 className="card-title">
										<i className="bi bi-receipt me-2"></i>
										Pedido #{pedido.id}
									</h5>
									<div className="mb-2">
										<p className="mb-1">
											<strong>
												<i className="bi bi-ticket-perforated me-1"></i>
												Ingressos:
											</strong>
										</p>
										<ul className="list-unstyled ms-3">
											<li>
												<small className="text-muted">
													Inteira: {pedido.qtInteira}
													<span className="text-primary ms-2">
                    (R$ {pedido.ingresso
														.filter(i => i.tipo === 'Inteira')
														.reduce((total, ingresso) => total + ingresso.valorFinal, 0)
														.toFixed(2)})
                </span>
												</small>
											</li>
											<li>
												<small className="text-muted">
													Meia: {pedido.qtMeia}
													<span className="text-success ms-2">
                    (R$ {pedido.ingresso
														.filter(i => i.tipo === 'Meia')
														.reduce((total, ingresso) => total + ingresso.valorFinal, 0)
														.toFixed(2)})
                </span>
												</small>
											</li>
											<li>
												<small className="text-muted">
													Total: {pedido.ingresso.length} ingresso(s)
												</small>
											</li>
											<li>
												<small className="text-muted">
													Assentos: {pedido.ingresso.length > 0
													? pedido.ingresso
														.map(i => {
															const linha = i.assentoLinha;
															const coluna = i.assentoColuna;
															if (linha && coluna) {
																return `${linha}-${coluna}`;
															}
															return 'N/A';
														})
														.join(', ')
													: 'N/A'}
												</small>
											</li>
											<li>
												<small className="fw-bold text-primary">
													Valor ingressos: R$ {pedido.ingresso
													.reduce((total, ingresso) => total + ingresso.valorFinal, 0)
													.toFixed(2)}
												</small>
											</li>
										</ul>
									</div>
									<div className="mb-3">
										<p className="mb-1">
											<strong>
												<i className="bi bi-bag me-1"></i>
												Lanches:
											</strong>
										</p>

										{pedido.lanche.length === 0 ? (
											<small className="text-muted ms-3">Nenhum lanche selecionado</small>
										) : (
											<div className="ms-3">
												{pedido.lanche.map((lanche, index) => (
													<div key={index}
														 className="d-flex justify-content-between align-items-center mb-2">
														<div>
															<small className="fw-medium">{lanche.nome}</small>
															{lanche.descricao && (
																<div>
																	<small
																		className="text-muted">{lanche.descricao}</small>
																</div>
															)}
															<div>
																<small className="text-muted">
																	{lanche.qtUnidade} un. ×
																	R$ {lanche.valorUnitario.toFixed(2)}
																</small>
															</div>
														</div>
														<div className="text-end">
															<small className="fw-bold text-primary">
																R$ {lanche.subtotal.toFixed(2)}
															</small>
														</div>
													</div>
												))}

												<div className="d-flex justify-content-between mt-3 pt-2 border-top">
													<small className="fw-bold">Total lanches:</small>
													<small className="fw-bold text-primary">
														R$ {pedido.lanche.reduce((total, lanche) =>
														total + lanche.subtotal, 0
													).toFixed(2)}
													</small>
												</div>
											</div>
										)}
									</div>
								<div className="mt-3">
									<h6 className="text-primary">
										<i className="bi bi-currency-dollar me-1"></i>
										Valor Total: R$ {pedido.valorTotal.toFixed(2)}
									</h6>
								</div>
							</div>
                                <div className="card-footer d-flex justify-content-between">
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => openEditModal(pedido)}>
                                        <i className="bi bi-pencil-square me-1"></i>
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => pedido.id && handleDelete(pedido.id)}
                                    >
                                        <i className="bi bi-trash me-1"></i>
                                        Excluir
                                    </button>
                                </div>
						</div>
					</div>
				))}

				{ingressosSemPedido.length > 0 && (
					<>
						<div className="col-12 mt-4 mb-4">
							<h4>
								<i className="bi bi-exclamation-triangle me-2"></i>
								Ingressos sem Pedido
							</h4>
							<p className="text-muted">Os ingressos abaixo não estão associados a nenhum pedido. Clique em "Criar Pedido" para associá-los.</p>
						</div>
						{ingressosSemPedido.map((ingresso) => (
							<div key={ingresso.id} className="col-md-6 mb-4">
								<div className="card h-100 border-warning">
									<div className="card-body">
										<h5 className="card-title">
											<i className="bi bi-ticket-perforated me-2"></i>
											Ingresso #{ingresso.id}
										</h5>
										<ul className="list-unstyled">
											<li>
												<small className="text-muted">
													<strong>Tipo:</strong> {ingresso.tipo}
												</small>
											</li>
											<li>
												<small className="text-muted">
													<strong>Assento:</strong> {ingresso.assentoLinha}-{ingresso.assentoColuna}
												</small>
											</li>
											<li>
												<small className="text-muted">
													<strong>Sessão ID:</strong> {ingresso.sessaoId}
												</small>
											</li>
											<li>
												<small className="fw-bold text-primary">
													<strong>Valor:</strong> R$ {ingresso.valorFinal.toFixed(2)}
												</small>
											</li>
										</ul>
									</div>
									<div className="card-footer">
										<button 
											className="btn btn-success btn-sm w-100"
											onClick={() => handleAssociarIngresso(ingresso)}
										>
											<i className="bi bi-plus-circle me-1"></i>
											Criar Pedido
										</button>
									</div>
								</div>
							</div>
						))}
					</>
				)}
			</div>
		)}
            {selectedPedido && selectedSessao && (
                <VenderIngressoModal
                    sessao={selectedSessao}
                    show={showModal}
                    onClose={closeModal}
                    onSuccess={loadPedidos}
                    pedidoInicial={selectedPedido}
                    modo="editar"
                />
            )}
        </div>
    );
};

