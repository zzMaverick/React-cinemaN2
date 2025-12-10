import {useEffect, useState} from 'react';
import {ingressoService} from '../../../services/ingressoService';
import {ingressoSchema} from '../../../schemas/ingressoSchema';
import type {IngressoFormData} from '../../../schemas/ingressoSchema';
import {TipoIngresso} from '../../../models/Ingresso';
import type {SessaoCompleta} from '../../../models/Sessao';
import type {Pedido} from '../../../models/Pedido';
import {Button} from '../../../components/Button';
import {lancheComboService} from '../../../services/lancheComboService';
import {pedidoService} from '../../../services/pedidoService';
import {pedidoSchema} from '../../../schemas/pedidoSchema';
import type {LancheCombo} from '../../../models/LancheCombo';
import {salaService} from '../../../services/salaService';
import type {Sala} from '../../../models/Sala';

interface VenderIngressoModalProps {
	sessao: SessaoCompleta;
	show: boolean;
	onClose: () => void;
	onSuccess: () => void;
	pedidoInicial?: Pedido;
	modo?: 'vender' | 'editar';
}

export const VenderIngressoModal = ({
										sessao,
										show,
										onClose,
										onSuccess,
										pedidoInicial,
										modo = 'vender',
									}: VenderIngressoModalProps) => {
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [errorsCombos, setErrorsCombos] = useState<string | null>(null);

	const [formData, setFormData] = useState<IngressoFormData>({
		tipo: TipoIngresso.INTEIRA,
		valorInteira: 20.0,
		valorMeia: 10.0,
		sessaoId: (sessao.id as number | string),
	});

	const [quantidadeInteira, setQuantidadeInteira] = useState<number>(0);
	const [quantidadeMeia, setQuantidadeMeia] = useState<number>(0);

	const [assentosSelecionados, setAssentosSelecionados] = useState<{
		assentoLinha: number;
		assentoColuna: number
	}[]>([]);
	const [ocupadosSet, setOcupadosSet] = useState<Set<string>>(new Set());
	const [salaInfo, setSalaInfo] = useState<Sala | null>(null);

	const [lanchesDisponiveis, setLanchesDisponiveis] = useState<LancheCombo[]>([]);
	const [lanchesSelecionados, setLanchesSelecionados] = useState<LancheCombo[]>([]);

	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		const loadCombos = async () => {
			try {
				const combos = await lancheComboService.getAll();
				setLanchesDisponiveis(combos);
			} catch (error) {
				console.error('Erro ao carregar combos:', error);
			}
		};
		if (show) {
			loadCombos();
		}
	}, [show]);

	useEffect(() => {
		const loadSalaEOcupados = async () => {
			try {
				const salas = await salaService.getAll();
				const salaEncontrada = salas.find(s => String(s.id) === String(sessao.sala?.id ?? sessao.salaId)) || null;
				setSalaInfo(salaEncontrada);

				const ingressos = await ingressoService.getAll();
				const ocupados = ingressos.filter(i => String(i.sessaoId) === String(sessao.id) && i.assentoLinha != null && i.assentoColuna != null);
				setOcupadosSet(new Set(ocupados.map(i => `${i.assentoLinha}-${i.assentoColuna}`)));
			} catch (error) {
				console.error('Erro ao carregar sala/assentos ocupados:', error);
			}
		};
		if (show) {
			loadSalaEOcupados();
		}
	}, [show, sessao]);

	useEffect(() => {
		if (show && pedidoInicial && modo === 'editar') {
			setQuantidadeInteira(0);
			setQuantidadeMeia(0);
			setAssentosSelecionados([]);
			setLanchesSelecionados([]);
			setErrors({});

			setTimeout(() => {
				setQuantidadeInteira(pedidoInicial.qtInteira || 0);
				setQuantidadeMeia(pedidoInicial.qtMeia || 0);

				if (pedidoInicial.ingresso && pedidoInicial.ingresso.length > 0) {
					setAssentosSelecionados(
						pedidoInicial.ingresso
							.filter(i => i.assentoLinha != null && i.assentoColuna != null)
							.map(i => ({
								assentoLinha: i.assentoLinha!,
								assentoColuna: i.assentoColuna!
							}))
					);
				}

				setLanchesSelecionados(pedidoInicial.lanche || []);

				const valorInt = (pedidoInicial.ingresso || [])
					.find(i => i.tipo === 'Inteira')?.valorFinal ?? formData.valorInteira;
				const valorMe = (pedidoInicial.ingresso || [])
					.find(i => i.tipo === 'Meia')?.valorFinal ?? formData.valorMeia;

				setFormData(prev => ({
					...prev,
					valorInteira: valorInt,
					valorMeia: valorMe
				}));
			}, 0);
		}
	}, [show, pedidoInicial, modo]);

	const totalAssentosNecessarios = quantidadeInteira + quantidadeMeia;

	const getGridConfig = () => {
		const capacidade = (salaInfo as any)?.capacidade ?? 0;
		const poltronas = salaInfo?.poltronas;
		if (poltronas && poltronas.length > 0) {
			const rows = poltronas.length;
			const cols = poltronas[0]?.length ?? 1;
			return {rows, cols};
		}
		const cols = capacidade ? Math.min(10, Math.max(5, Math.round(Math.sqrt(capacidade)))) : 10;
		const rows = capacidade ? Math.ceil(capacidade / cols) : 5;
		return {rows, cols};
	};

	const calcularValorTotalIngressos = (): number => {
		const totalInteira = quantidadeInteira * formData.valorInteira;
		const totalMeia = quantidadeMeia * formData.valorMeia;
		return totalInteira + totalMeia;
	};

	const calcularTotalCombos = (): number => {
		return lanchesSelecionados.reduce((acc, lanche) => acc + (lanche.subtotal || 0), 0);
	};

	const calcularTotalGeral = (): number => {
		return calcularValorTotalIngressos() + calcularTotalCombos();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const {name, value} = e.target;

		if (name === 'quantidadeInteira') {
			const num = Math.max(0, Number(value));
			setQuantidadeInteira(num);
			const novoTotal = num + quantidadeMeia;
			if (assentosSelecionados.length > novoTotal) {
				setAssentosSelecionados(prev => prev.slice(0, novoTotal));
			}
		} else if (name === 'quantidadeMeia') {
			const num = Math.max(0, Number(value));
			setQuantidadeMeia(num);
			const novoTotal = quantidadeInteira + num;
			if (assentosSelecionados.length > novoTotal) {
				setAssentosSelecionados(prev => prev.slice(0, novoTotal));
			}
		} else {
			setFormData(prev => ({
				...prev,
				[name]: name === 'valorInteira' || name === 'valorMeia' || name === 'sessaoId'
					? Number(value)
					: value,
			}));
		}

		if (errors[name]) {
			setErrors(prev => {
				const newErrors = {...prev};
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const toggleAssento = (linha: number, coluna: number) => {
		const key = `${linha}-${coluna}`;
		if (modo === 'vender' && ocupadosSet.has(key)) return;

		const exists = assentosSelecionados.find(a => a.assentoLinha === linha && a.assentoColuna === coluna);

		if (exists) {
			setAssentosSelecionados(prev => prev.filter(a => !(a.assentoLinha === linha && a.assentoColuna === coluna)));
		} else {
			if (totalAssentosNecessarios === 0) {
				setErrors(prev => ({...prev, assentos: 'Informe quantidades de ingressos para selecionar assentos'}));
				return;
			}
			if (assentosSelecionados.length < totalAssentosNecessarios) {
				setAssentosSelecionados(prev => [...prev, {assentoLinha: linha, assentoColuna: coluna}]);
			} else {
				setAssentosSelecionados(prev => {
					const next = prev.slice(1);
					return [...next, {assentoLinha: linha, assentoColuna: coluna}];
				});
			}
			if (errors.assentos) {
				setErrors(prev => {
					const n = {...prev};
					delete (n as any).assentos;
					return n;
				});
			}
		}
	};

	const handleClose = () => {
		setQuantidadeInteira(0);
		setQuantidadeMeia(0);
		setAssentosSelecionados([]);
		setLanchesSelecionados([]);
		setErrors({});
		setErrorsCombos(null);
		onClose();
	};

	const validarFormulario = (): boolean => {
		const novasErros: Record<string, string> = {};

		if (quantidadeInteira <= 0 && quantidadeMeia <= 0) {
			novasErros.quantidade = 'Informe ao menos uma quantidade de ingresso';
		}

		if (assentosSelecionados.length !== totalAssentosNecessarios) {
			novasErros.assentos = `Selecione exatamente ${totalAssentosNecessarios} assento(s)`;
		}

		const assentosKeys = assentosSelecionados.map(a => `${a.assentoLinha}-${a.assentoColuna}`);
		if (new Set(assentosKeys).size !== assentosKeys.length) {
			novasErros.assentos = 'Não é possível selecionar o mesmo assento mais de uma vez';
		}

		if (modo === 'vender') {
			const ocupadosNoSelecionados = assentosSelecionados.some(seat =>
				ocupadosSet.has(`${seat.assentoLinha}-${seat.assentoColuna}`)
			);
			if (ocupadosNoSelecionados) {
				novasErros.assentos = 'Um ou mais assentos selecionados já estão ocupados';
			}
		}

		try {
			const sessaoIdFinal = sessao.id || formData.sessaoId;
			const dataToValidate = {
				...formData,
				sessaoId: sessaoIdFinal,
			};
			ingressoSchema.parse(dataToValidate);
		} catch (error: any) {
			if (error.issues) {
				error.issues.forEach((issue: any) => {
					if (issue.path && issue.path.length > 0) {
						novasErros[issue.path[0]] = issue.message;
					}
				});
			}
		}

		try {
			pedidoSchema.parse({ qtInteira: quantidadeInteira, qtMeia: quantidadeMeia });
		} catch (error: any) {
			if (error.issues && error.issues.length > 0) {
				novasErros.pedido = error.issues[0].message;
			}
		}

		setErrors(novasErros);
		return Object.keys(novasErros).length === 0;
	};

	const criarIngressos = async (qtInteira: number, qtMeia: number): Promise<Awaited<ReturnType<typeof ingressoService.create>>[]> => {
		const ingressosCriados = [];
		let seatIndex = 0;

		try {
			if (qtInteira > 0) {
				for (let i = 0; i < qtInteira; i++) {
					const seat = assentosSelecionados[seatIndex++];
					const criado = await ingressoService.create({
						...formData,
						tipo: TipoIngresso.INTEIRA,
						valorFinal: formData.valorInteira,
						assentoLinha: seat.assentoLinha,
						assentoColuna: seat.assentoColuna,
					});
					ingressosCriados.push(criado);
				}
			}

			if (qtMeia > 0) {
				for (let j = 0; j < qtMeia; j++) {
					const seat = assentosSelecionados[seatIndex++];
					const criado = await ingressoService.create({
						...formData,
						tipo: TipoIngresso.MEIA,
						valorFinal: formData.valorMeia,
						assentoLinha: seat.assentoLinha,
						assentoColuna: seat.assentoColuna,
					});
					ingressosCriados.push(criado);
				}
			}

			return ingressosCriados;
		} catch (error) {
			for (const ingresso of ingressosCriados) {
				if (ingresso?.id) {
					try {
						await ingressoService.delete(ingresso.id);
					} catch (e) {
						console.error('Erro ao fazer rollback de ingresso:', e);
					}
				}
			}
			throw error;
		}
	};

	const atualizarEstoqueCombos = async (): Promise<void> => {
		if (lanchesSelecionados.length === 0) return;

		const countsById: Record<string, number> = {};
		lanchesSelecionados.forEach(l => {
			const key = String(l.id);
			countsById[key] = (countsById[key] || 0) + (l.qtUnidade || 1);
		});

		const insuficientes = Object.entries(countsById).filter(([id, solicitado]) => {
			const combo = lanchesDisponiveis.find(c => String(c.id) === id);
			if (!combo) return true;
			const disponivel = combo.qtDisponivel ?? 0;
			return solicitado > disponivel || disponivel <= 0;
		});

		if (insuficientes.length > 0) {
			setErrorsCombos('Existem combos selecionados sem estoque suficiente ou esgotados.');
			throw new Error('Estoque insuficiente para combos');
		}

		await Promise.all(Object.entries(countsById).map(async ([id, solicitado]) => {
			const combo = lanchesDisponiveis.find(c => String(c.id) === id);
			if (!combo) return;
			const novoDisponivel = Math.max(0, (combo.qtDisponivel ?? 0) - solicitado);
			await lancheComboService.update(combo.id!, {
				nome: combo.nome,
				descricao: combo.descricao,
				valorUnitario: combo.valorUnitario,
				qtUnidade: combo.qtUnidade,
				qtDisponivel: novoDisponivel,
			});
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;

		setIsSubmitting(true);
		setErrors({});
		setErrorsCombos(null);

		try {
			if (!validarFormulario()) {
				setIsSubmitting(false);
				return;
			}

			const qtInteira = quantidadeInteira;
			const qtMeia = quantidadeMeia;
			const sessaoIdFinal = sessao.id || formData.sessaoId;

			if (!sessaoIdFinal) {
				alert('Erro: ID da sessão inválido');
				setIsSubmitting(false);
				return;
			}

			if (modo === 'editar' && pedidoInicial) {
				const prevSeatsKey = (pedidoInicial.ingresso || [])
					.map(i => `${i.assentoLinha}-${i.assentoColuna}`)
					.sort()
					.join('|');
				const newSeatsKey = assentosSelecionados
					.map(a => `${a.assentoLinha}-${a.assentoColuna}`)
					.sort()
					.join('|');
				const sameQt = (pedidoInicial.qtInteira === qtInteira) && (pedidoInicial.qtMeia === qtMeia);
				const sameSeats = prevSeatsKey === newSeatsKey;

				if (sameQt && sameSeats) {
					await atualizarEstoqueCombos();
					await pedidoService.update(pedidoInicial.id!, {
						...pedidoInicial,
						lanche: lanchesSelecionados,
						qtInteira,
						qtMeia,
					});
					alert('Pedido atualizado com sucesso.');
					setTimeout(() => { onSuccess(); handleClose(); }, 100);
					setIsSubmitting(false);
					return;
				}

				for (const i of (pedidoInicial.ingresso || [])) {
					if (i.id) {
						try {
							await ingressoService.delete(i.id);
						} catch (e) {
							console.error('Falha ao excluir ingresso antigo', e);
						}
					}
				}

				const novosIngressos = await criarIngressos(qtInteira, qtMeia);

				await atualizarEstoqueCombos();

				await pedidoService.update(pedidoInicial.id!, {
					...pedidoInicial,
					ingresso: novosIngressos,
					lanche: lanchesSelecionados,
					qtInteira,
					qtMeia,
				});

				alert('Pedido atualizado com sucesso.');
				setTimeout(() => { onSuccess(); handleClose(); }, 100);
				setIsSubmitting(false);
				return;
			}

			if (lanchesSelecionados.length > 0) {
				await atualizarEstoqueCombos();
			}

			const ingressosCriados = await criarIngressos(qtInteira, qtMeia);

			await pedidoService.create({
				qtInteira,
				qtMeia,
				ingresso: ingressosCriados,
				lanche: lanchesSelecionados,
			});

			const filmeNome = sessao.filme?.titulo || 'N/A';
			const salaNumero = sessao.sala?.numero || 'N/A';
			const assentosMsg = assentosSelecionados.map(a => `${a.assentoLinha}-${a.assentoColuna}`).join(', ');
			const totalCombosMsg = lanchesSelecionados.length > 0 ? `\nTotal dos combos: R$ ${calcularTotalCombos().toFixed(2)}` : '';

			alert(
				`Ingressos vendidos e pedido criado com sucesso!\n\n` +
				`Inteiras: ${qtInteira}\n` +
				`Meias: ${qtMeia}\n` +
				`Assentos: ${assentosMsg}\n` +
				`Valor total (ingressos): R$ ${calcularValorTotalIngressos().toFixed(2)}${totalCombosMsg}\n` +
				`Total geral: R$ ${calcularTotalGeral().toFixed(2)}\n` +
				`Sessão: ${filmeNome} - Sala ${salaNumero}`
			);

			setTimeout(() => {
				onSuccess();
				handleClose();
			}, 100);

		} catch (error: any) {
			console.error('Erro ao vender ingresso:', error);

			if (error.response) {
				const errorMessage = error.response.data?.message || error.response.statusText || 'Erro ao vender ingresso';
				alert(`Erro: ${errorMessage}`);
			} else if (error.request) {
				alert('Erro: Não foi possível conectar ao servidor. Verifique se o json-server está rodando na porta 3000.');
			} else if (error.message === 'Estoque insuficiente para combos') {
			} else {
				alert(`Erro: ${error.message || 'Erro desconhecido ao vender ingresso'}`);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!show) return null;

	return (
		<div
			className="modal show d-block"
			tabIndex={-1}
			style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
		>
			<div className="modal-dialog modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">
							<i className="bi bi-ticket-perforated me-2"></i>
							{modo === 'editar' ? 'Editar Pedido' : 'Vender Ingresso'}
						</h5>
						<button
							type="button"
							className="btn-close"
							onClick={handleClose}
						></button>
					</div>
					<form onSubmit={handleSubmit} onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
						}
					}}>
						<div className="modal-body" style={{maxHeight: '70vh', overflowY: 'auto'}}>
							<div className="card mb-3">
								<div className="card-header">
									<h6 className="mb-0">
										<i className="bi bi-info-circle me-2"></i>
										Informações da Sessão
									</h6>
								</div>
								<div className="card-body">
									<div className="row">
										<div className="col-md-6">
											<p><strong>Filme:</strong> {sessao.filme?.titulo || 'N/A'}</p>
										</div>
										<div className="col-md-6">
											<p><strong>Sala:</strong> {sessao.sala?.numero || 'N/A'}</p>
										</div>
									</div>
									<p><strong>Horário:</strong> {new Date(sessao.horarioExibicao).toLocaleString('pt-BR')}</p>
								</div>
							</div>

							<div className="card mb-3">
								<div className="card-header">
									<h6 className="mb-0">
										<i className="bi bi-ticket me-2"></i>
										Quantidade de Ingressos
									</h6>
								</div>
								<div className="card-body">
									<div className="row">
										<div className="col-md-6 mb-3">
											<label htmlFor="quantidadeInteira" className="form-label">Quantidade Inteira</label>
											<input
												id="quantidadeInteira"
												name="quantidadeInteira"
												type="number"
												min={0}
												className={`form-control ${errors.quantidadeInteira ? 'is-invalid' : ''}`}
												value={quantidadeInteira}
												onChange={handleChange}
											/>
											{errors.quantidadeInteira && (
												<div className="text-danger small mt-1">
													<i className="bi bi-exclamation-circle me-1"></i>
													{errors.quantidadeInteira}
												</div>
											)}
										</div>
										<div className="col-md-6 mb-3">
											<label htmlFor="quantidadeMeia" className="form-label">Quantidade Meia</label>
											<input
												id="quantidadeMeia"
												name="quantidadeMeia"
												type="number"
												min={0}
												className={`form-control ${errors.quantidadeMeia ? 'is-invalid' : ''}`}
												value={quantidadeMeia}
												onChange={handleChange}
											/>
											{errors.quantidadeMeia && (
												<div className="text-danger small mt-1">
													<i className="bi bi-exclamation-circle me-1"></i>
													{errors.quantidadeMeia}
												</div>
											)}
										</div>
									</div>
									{errors.quantidade && (
										<div className="alert alert-danger">
											<i className="bi bi-exclamation-circle me-1"></i>
											{errors.quantidade}
										</div>
									)}
								</div>
							</div>

							<div className="card mb-3">
								<div className="card-header">
									<h6 className="mb-0">
										<i className="bi bi-cash-coin me-2"></i>
										Valores dos Ingressos
									</h6>
								</div>
								<div className="card-body">
									<div className="row">
										<div className="col-md-6 mb-3">
											<label htmlFor="valorInteira" className="form-label">Valor Inteira (R$)</label>
											<input
												id="valorInteira"
												name="valorInteira"
												type="number"
												step="0.01"
												className={`form-control ${errors.valorInteira ? 'is-invalid' : ''}`}
												value={formData.valorInteira}
												onChange={handleChange}
												disabled={modo === 'editar'}
											/>
											{errors.valorInteira && (
												<div className="text-danger small mt-1">
													<i className="bi bi-exclamation-circle me-1"></i>
													{errors.valorInteira}
												</div>
											)}
										</div>
										<div className="col-md-6 mb-3">
											<label htmlFor="valorMeia" className="form-label">Valor Meia (R$)</label>
											<input
												id="valorMeia"
												name="valorMeia"
												type="number"
												step="0.01"
												className={`form-control ${errors.valorMeia ? 'is-invalid' : ''}`}
												value={formData.valorMeia}
												onChange={handleChange}
												disabled={modo === 'editar'}
											/>
											{errors.valorMeia && (
												<div className="text-danger small mt-1">
													<i className="bi bi-exclamation-circle me-1"></i>
													{errors.valorMeia}
												</div>
											)}
										</div>
									</div>
									<div className="alert alert-info mb-0">
										<strong>Valor Total (ingressos):</strong> R$ {calcularValorTotalIngressos().toFixed(2)}
									</div>
								</div>
							</div>

							<div className="card mb-3">
								<div className="card-header">
									<h6 className="mb-0">
										<i className="bi bi-grid-3x3-gap me-2"></i>
										Selecionar Assentos
									</h6>
								</div>
								<div className="card-body">
									<div className="mb-2">
										<small className="text-muted">
											Necessários: <strong>{totalAssentosNecessarios}</strong> • 
											Selecionados: <strong>{assentosSelecionados.length}</strong>
										</small>
									</div>
									{totalAssentosNecessarios === 0 && (
										<div className="alert alert-warning mb-0">
											<i className="bi bi-info-circle me-2"></i>
											Informe quantidades de ingressos para habilitar a seleção de assentos.
										</div>
									)}
									{totalAssentosNecessarios > 0 && (
										<>
											{(() => {
												const {rows, cols} = getGridConfig();
												return (
													<div className="d-flex flex-column gap-2">
														{Array.from({length: rows}, (_, r) => (
															<div key={`row-${r + 1}`} className="d-flex flex-wrap gap-2">
																{Array.from({length: cols}, (_, c) => {
																	const linha = r + 1;
																	const coluna = c + 1;
																	const key = `${linha}-${coluna}`;
																	const ocupado = ocupadosSet.has(key);
																	const selecionado = assentosSelecionados.some(a => a.assentoLinha === linha && a.assentoColuna === coluna);
																	const ocupadosDoPedido = new Set((pedidoInicial?.ingresso || []).map(i => `${i.assentoLinha}-${i.assentoColuna}`));
																	const isMine = modo === 'editar' && pedidoInicial ? ocupadosDoPedido.has(key) : false;
																	const btnClass = ocupado
																		? (selecionado ? 'btn btn-sm btn-success' : 'btn btn-sm btn-secondary')
																		: (selecionado ? 'btn btn-sm btn-success' : 'btn btn-sm btn-outline-secondary');
																	return (
																		<button
																			type="button"
																			key={`seat-${key}`}
																			className={btnClass}
																			disabled={totalAssentosNecessarios === 0 || (ocupado && !(modo === 'editar' && isMine))}
																			onClick={() => toggleAssento(linha, coluna)}
																		>
																			{linha}-{coluna}
																		</button>
																	);
																})}
															</div>
														))}
													</div>
												);
											})()}
											{errors.assentos && (
												<div className="text-danger small mt-2">
													<i className="bi bi-exclamation-circle me-1"></i>
													{errors.assentos}
												</div>
											)}
										</>
									)}
								</div>
							</div>

							<div className="card mb-3">
								<div className="card-header">
									<h6 className="mb-0">
										<i className="bi bi-bag me-2"></i>
										Selecionar Combos
									</h6>
								</div>
								<div className="card-body">
									{lanchesDisponiveis.length === 0 ? (
										<div className="alert alert-secondary mb-0">
											Nenhum combo disponível.
										</div>
									) : (
										<div className="row mb-3">
											{lanchesDisponiveis.map((lanche) => (
												<div key={lanche.id} className="col-md-6 mb-3">
													<div className="card h-100">
														<div className="card-body">
															<h6 className="card-title">{lanche.nome}</h6>
															<p className="card-text small text-muted">{lanche.descricao}</p>
															<p className="card-text">
																<strong>R$ {lanche.valorUnitario.toFixed(2)}</strong>
																<small className="text-muted ms-2">
																	x{lanche.qtUnidade} =
																	R$ {lanche.subtotal.toFixed(2)}
																</small>
															</p>
															<p className="card-text">
																<small
																	className={lanche.qtDisponivel! <= 0 ? 'text-danger' : 'text-muted'}>
																	Disponíveis: {lanche.qtDisponivel ?? lanche.qtUnidade}
																</small>
															</p>
															<button
																type="button"
																className="btn btn-sm btn-primary w-100"
																disabled={(lanche.qtDisponivel ?? lanche.qtUnidade) <= 0}
																onClick={() => setLanchesSelecionados(prev => [...prev, {
																	...lanche,
																	qtUnidade: 1,
																	subtotal: lanche.valorUnitario
																}])}
															>
																<i className="bi bi-plus-circle me-1"></i>
																Adicionar
															</button>
														</div>
													</div>
												</div>
											))}
										</div>
									)}

									<div className="mt-3">
										<h6>
											<i className="bi bi-check-circle me-2"></i>
											Combos Selecionados ({lanchesSelecionados.length})
										</h6>
										{lanchesSelecionados.length === 0 ? (
											<div className="alert alert-secondary">
												<small>Nenhum combo adicionado.</small>
											</div>
										) : (
											<ul className="list-group mb-3">
												{lanchesSelecionados.map((lanche, index) => (
													<li key={`lanche-${lanche.id}-${index}`}
														className="list-group-item d-flex justify-content-between align-items-center">
														<div>
															<strong>{lanche.nome}</strong> - {lanche.descricao}
															<br/>
															<small className="text-muted">
																R$ {lanche.valorUnitario.toFixed(2)} x {lanche.qtUnidade} =
																R$ {lanche.subtotal.toFixed(2)}
															</small>
														</div>
														<button
															type="button"
															className="btn btn-sm btn-danger"
															onClick={() => setLanchesSelecionados(prev => prev.filter((_, i) => i !== index))}
														>
															<i className="bi bi-trash"></i>
														</button>
													</li>
												))}
											</ul>
										)}
										{lanchesSelecionados.length > 0 && (
											<div className="alert alert-info mb-0">
												<strong>Total dos combos:</strong> R$ {calcularTotalCombos().toFixed(2)}
											</div>
										)}
										{errorsCombos && (
											<div className="alert alert-danger mt-2 mb-0">
												<i className="bi bi-exclamation-circle me-1"></i>
												{errorsCombos}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button
								type="button"
								className="btn btn-secondary"
								onClick={handleClose}
								disabled={isSubmitting}
							>
								Cancelar
							</button>
							<div className="me-auto text-muted">
								<small>
									Total geral: <strong>R$ {calcularTotalGeral().toFixed(2)}</strong>
								</small>
							</div>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Processando...' : (modo === 'editar' ? 'Salvar Alterações' : 'Confirmar Venda')}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};
