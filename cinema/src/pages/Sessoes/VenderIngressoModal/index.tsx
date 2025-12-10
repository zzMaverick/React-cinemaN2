import {useEffect, useState} from 'react';
import {ingressoService} from '../../../services/ingressoService';
import {ingressoSchema} from '../../../schemas/ingressoSchema';
import type {IngressoFormData} from '../../../schemas/ingressoSchema';
import {TipoIngresso} from '../../../models/Ingresso';
import type {SessaoCompleta} from '../../../models/Sessao';
import {Button} from '../../../components/Button';
import {lancheComboService} from '../../../services/lancheComboService';
import {pedidoService} from '../../../services/pedidoService';
import type {LancheCombo} from '../../../models/LancheCombo';

interface VenderIngressoModalProps {
    sessao: SessaoCompleta;
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const VenderIngressoModal = ({
                                        sessao,
                                        show,
                                        onClose,
                                        onSuccess,
                                    }: VenderIngressoModalProps) => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<IngressoFormData>({
        tipo: TipoIngresso.INTEIRA,
        valorInteira: 20.0,
        valorMeia: 10.0,
        sessaoId: (sessao.id as number | string),
    });
    const [criarPedido, setCriarPedido] = useState(false);
    const [lanchesDisponiveis, setLanchesDisponiveis] = useState<LancheCombo[]>([]);
    const [lanchesSelecionados, setLanchesSelecionados] = useState<LancheCombo[]>([]);
    const [errorsCombos, setErrorsCombos] = useState<string | null>(null);
    const [quantidadeInteira, setQuantidadeInteira] = useState<number>(0);
    const [quantidadeMeia, setQuantidadeMeia] = useState<number>(0);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        if (name === 'quantidadeInteira') {
            const num = Math.max(0, Number(value));
            setQuantidadeInteira(num);
        } else if (name === 'quantidadeMeia') {
            const num = Math.max(0, Number(value));
            setQuantidadeMeia(num);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            const sessaoIdFinal = sessao.id || formData.sessaoId;

            if (!sessaoIdFinal) {
                alert('Erro: ID da sessão inválido');
                return;
            }

            if ((quantidadeInteira <= 0) && (quantidadeMeia <= 0)) {
                setErrors(prev => ({
                    ...prev,
                    quantidadeInteira: 'Informe ao menos uma quantidade',
                    quantidadeMeia: 'Informe ao menos uma quantidade',
                }));
                return;
            }

            const dataToValidate = {
                ...formData,
                sessaoId: sessaoIdFinal,
            };

            const validatedData = ingressoSchema.parse(dataToValidate);

            const ingressosCriados = [] as Awaited<ReturnType<typeof ingressoService.create>>[];
            if (quantidadeInteira > 0) {
                for (let i = 0; i < quantidadeInteira; i++) {
                    const criado = await ingressoService.create({
                        ...validatedData,
                        tipo: TipoIngresso.INTEIRA,
                        valorFinal: formData.valorInteira,
                    });
                    ingressosCriados.push(criado);
                }
            }
            if (quantidadeMeia > 0) {
                for (let j = 0; j < quantidadeMeia; j++) {
                    const criado = await ingressoService.create({
                        ...validatedData,
                        tipo: TipoIngresso.MEIA,
                        valorFinal: formData.valorMeia,
                    });
                    ingressosCriados.push(criado);
                }
            }

            if (criarPedido) {

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
                    return;
                }

                const qtInteira = quantidadeInteira;
                const qtMeia = quantidadeMeia;
                await pedidoService.create({
                    qtInteira,
                    qtMeia,
                    ingresso: ingressosCriados,
                    lanche: lanchesSelecionados,
                });


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
            }

            const filmeNome = sessao.filme?.titulo || 'N/A';
            const salaNumero = sessao.sala?.numero || 'N/A';
            const pedidoMsg = criarPedido ? `\nTotal dos combos: R$ ${calcularTotalCombos().toFixed(2)}\nTotal geral: R$ ${calcularTotalGeral().toFixed(2)}\nPedido criado junto com os ingressos.` : '';
            alert(`Ingressos vendidos com sucesso!\n\nInteiras: ${quantidadeInteira}\nMeias: ${quantidadeMeia}\nValor total (ingressos): R$ ${calcularValorTotalIngressos().toFixed(2)}\nSessão: ${filmeNome} - Sala ${salaNumero}${pedidoMsg}`);

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 100);
        } catch (error: any) {
            if (error.issues) {
                const fieldErrors: Record<string, string> = {};
                error.issues.forEach((issue: any) => {
                    if (issue.path && issue.path.length > 0) {
                        fieldErrors[issue.path[0]] = issue.message;
                    }
                });
                setErrors(fieldErrors);
            } else if (error.response) {
                const errorMessage = error.response.data?.message || error.response.statusText || 'Erro ao vender ingresso';
                alert(`Erro: ${errorMessage}`);
                console.error('Erro da API:', error.response.data);
            } else if (error.request) {
                alert('Erro: Não foi possível conectar ao servidor. Verifique se o json-server está rodando na porta 3000.');
                console.error('Erro de conexão:', error.request);
            } else {
                alert(`Erro: ${error.message || 'Erro desconhecido ao vender ingresso'}`);
                console.error('Erro:', error);
            }
        }
    };

    if (!show) return null;

    return (
        <div
            className="modal show d-block"
            tabIndex={-1}
            style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-ticket-perforated me-2"></i>
                            Vender Ingresso
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <p>
                                    <strong>Filme:</strong> {sessao.filme?.titulo || 'N/A'}
                                </p>
                                <p>
                                    <strong>Sala:</strong> {sessao.sala?.numero || 'N/A'}
                                </p>
                                <p>
                                    <strong>Horário:</strong>{' '}
                                    {new Date(sessao.horarioExibicao).toLocaleString('pt-BR')}
                                </p>
                            </div>
                            <div className="mb-3">
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

                            <div className="mb-3">
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

                            <div className="mb-3">
                                <label htmlFor="valorInteira" className="form-label">Valor Inteira (R$)</label>
                                <input
                                    id="valorInteira"
                                    name="valorInteira"
                                    type="number"
                                    step="0.01"
                                    className={`form-control ${errors.valorInteira ? 'is-invalid' : ''}`}
                                    value={formData.valorInteira}
                                    onChange={handleChange}
                                />
                                {errors.valorInteira && (
                                    <div className="text-danger small mt-1">
                                        <i className="bi bi-exclamation-circle me-1"></i>
                                        {errors.valorInteira}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="valorMeia" className="form-label">Valor Meia (R$)</label>
                                <input
                                    id="valorMeia"
                                    name="valorMeia"
                                    type="number"
                                    step="0.01"
                                    className={`form-control ${errors.valorMeia ? 'is-invalid' : ''}`}
                                    value={formData.valorMeia}
                                    onChange={handleChange}
                                />
                                {errors.valorMeia && (
                                    <div className="text-danger small mt-1">
                                        <i className="bi bi-exclamation-circle me-1"></i>
                                        {errors.valorMeia}
                                    </div>
                                )}
                            </div>

                            <div className="alert alert-info">
                                <strong>Valor Total (ingressos):</strong> R${' '}
                                {calcularValorTotalIngressos().toFixed(2)}
                            </div>

                            <div className="form-check form-switch mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="criarPedidoSwitch"
                                    checked={criarPedido}
                                    onChange={(e) => setCriarPedido(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="criarPedidoSwitch">
                                    Criar pedido junto com estes ingressos
                                </label>
                            </div>

                            {criarPedido && (
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">
                                            <i className="bi bi-bag me-2"></i>
                                            Selecionar Combos
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        {lanchesDisponiveis.length === 0 ? (
                                            <div className="alert alert-secondary">
                                                Nenhum combo disponível.
                                            </div>
                                        ) : (
                                            <div className="row">
                                                {lanchesDisponiveis.map((lanche) => (
                                                    <div key={lanche.id} className="col-md-6 mb-2">
                                                        <div className="card h-100">
                                                            <div className="card-body">
                                                                <h6 className="card-title">{lanche.nome}</h6>
                                                                <p className="card-text small">{lanche.descricao}</p>
                                                                <p className="card-text">
                                                                    <strong>R$ {lanche.valorUnitario.toFixed(2)}</strong>
                                                                    <small className="text-muted ms-2">
                                                                        x{lanche.qtUnidade} =
                                                                        R$ {lanche.subtotal.toFixed(2)}
                                                                    </small>
                                                                </p>
                                                                <p className="card-text">
                                                                    <small
                                                                        className="text-muted">Disponíveis: {lanche.qtDisponivel ?? lanche.qtUnidade}</small>
                                                                </p>
                                                                <div className="d-flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-primary"
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
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-3">
                                            <h6>Combos Selecionados ({lanchesSelecionados.length}):</h6>
                                            {lanchesSelecionados.length === 0 ? (
                                                <div className="alert alert-secondary">
                                                    <small>Nenhum combo adicionado.</small>
                                                </div>
                                            ) : (
                                                <ul className="list-group">
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
                                                <div className="alert alert-info mt-3">
                                                    <strong>Total dos
                                                        combos:</strong> R$ {calcularTotalCombos().toFixed(2)}
                                                </div>
                                            )}
                                            {errorsCombos && (
                                                <div className="alert alert-danger mt-2">
                                                    <i className="bi bi-exclamation-circle me-1"></i>
                                                    {errorsCombos}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <Button
                                type="button"
                                label="Cancelar"
                                variant="secondary"
                                onClick={onClose}
                            />
                            <div className="me-auto text-muted">
                                <small>
                                    Total geral: R$ {calcularTotalGeral().toFixed(2)}
                                </small>
                            </div>
                            <Button type="submit" label="Confirmar Venda" variant="primary"/>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

