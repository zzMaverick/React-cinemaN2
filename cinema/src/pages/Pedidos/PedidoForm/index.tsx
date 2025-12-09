import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pedidoService } from '../../../services/pedidoService';
import { ingressoService } from '../../../services/ingressoService';
import { lancheComboService } from '../../../services/lancheComboService';
import type { Pedido } from '../../../models/Pedido';
import type { Ingresso } from '../../../models/Ingresso';
import type { LancheCombo } from '../../../models/LancheCombo';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { lancheComboSchema } from '../../../schemas/lancheComboSchema';
import type { LancheComboFormData } from '../../../schemas/lancheComboSchema';

export const PedidoForm = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ingressosDisponiveis, setIngressosDisponiveis] = useState<Ingresso[]>([]);
  const [lanchesDisponiveis, setLanchesDisponiveis] = useState<LancheCombo[]>([]);
  const [ingressosSelecionados, setIngressosSelecionados] = useState<Ingresso[]>([]);
  const [lanchesSelecionados, setLanchesSelecionados] = useState<LancheCombo[]>([]);
  const [showLancheForm, setShowLancheForm] = useState(false);
  const [lancheFormData, setLancheFormData] = useState<LancheComboFormData>({
    nome: '',
    descricao: '',
    valorUnitario: 0,
    qtUnidade: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ingressos, lanches] = await Promise.all([
        ingressoService.getAll(),
        lancheComboService.getAll(),
      ]);
      setIngressosDisponiveis(ingressos);
      setLanchesDisponiveis(lanches);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const calcularValorTotal = (): number => {
    const valorIngressos = ingressosSelecionados.reduce((total, ingresso) => total + ingresso.valorFinal, 0);
    const valorLanches = lanchesSelecionados.reduce((total, lanche) => total + lanche.subtotal, 0);
    return valorIngressos + valorLanches;
  };

  const calcularQuantidades = () => {
    const qtInteira = ingressosSelecionados.filter(i => i.tipo === 'Inteira').length;
    const qtMeia = ingressosSelecionados.filter(i => i.tipo === 'Meia').length;
    return { qtInteira, qtMeia };
  };

  const handleAdicionarIngresso = (ingresso: Ingresso) => {
    setIngressosSelecionados([...ingressosSelecionados, ingresso]);
  };

  const handleRemoverIngresso = (index: number) => {
    setIngressosSelecionados(ingressosSelecionados.filter((_, i) => i !== index));
  };

  const handleAdicionarLanche = (lanche: LancheCombo) => {
    console.log('=== ADICIONANDO LANCHE ===');
    console.log('Lanche recebido:', lanche);
    console.log('Estado atual ANTES:', lanchesSelecionados);
    
    // Cria uma nova cópia do objeto para garantir que o React detecte a mudança
    const novoLanche: LancheCombo = {
      ...lanche,
      subtotal: lanche.subtotal || (lanche.valorUnitario * lanche.qtUnidade)
    };
    
    console.log('Novo lanche criado:', novoLanche);
    
    // Usa função de atualização para garantir que o estado seja atualizado corretamente
    setLanchesSelecionados(prev => {
      const novos = [...prev, novoLanche];
      console.log('Novo estado DENTRO do setState:', novos);
      console.log('Tamanho do array:', novos.length);
      return novos;
    });
    
    // Verifica o estado após um pequeno delay
    setTimeout(() => {
      console.log('Estado após timeout:', lanchesSelecionados);
    }, 100);
  };

  const handleRemoverLanche = (index: number) => {
    setLanchesSelecionados(lanchesSelecionados.filter((_, i) => i !== index));
  };

  const handleLancheFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLancheFormData(prev => ({
      ...prev,
      [name]: name === 'valorUnitario' || name === 'qtUnidade' ? Number(value) : value,
    }));
  };

  const handleCriarLanche = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrors({});

    try {
      const validatedData = lancheComboSchema.parse(lancheFormData);
      const novoLanche = await lancheComboService.create(validatedData);
      setLanchesDisponiveis(prev => [...prev, novoLanche]);
      // Adiciona automaticamente o novo combo aos selecionados
      setLanchesSelecionados(prev => [...prev, novoLanche]);
      setLancheFormData({
        nome: '',
        descricao: '',
        valorUnitario: 0,
        qtUnidade: 1,
      });
      setShowLancheForm(false);
      alert('Lanche combo criado e adicionado ao pedido com sucesso!');
    } catch (error: any) {
      if (error.issues) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue: any) => {
          if (issue.path && issue.path.length > 0) {
            fieldErrors[issue.path[0]] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        alert('Erro ao criar lanche combo. Tente novamente.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ingressosSelecionados.length === 0) {
      alert('Adicione pelo menos um ingresso ao pedido.');
      return;
    }

    try {
      const { qtInteira, qtMeia } = calcularQuantidades();
      const valorTotal = calcularValorTotal();

      const novoPedido: Omit<Pedido, 'id'> = {
        qtInteira,
        qtMeia,
        ingresso: ingressosSelecionados,
        lanche: lanchesSelecionados,
        valorTotal,
      };

      await pedidoService.create(novoPedido);
      alert('Pedido criado com sucesso!');
      navigate('/pedidos');
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      if (error.response) {
        alert(`Erro: ${error.response.data?.message || 'Erro ao criar pedido'}`);
      } else if (error.request) {
        alert('Erro: Não foi possível conectar ao servidor.');
      } else {
        alert('Erro ao criar pedido. Tente novamente.');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Carregando...</div>;
  }

  const valorTotal = calcularValorTotal();

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <h1 className="mb-4">
            <i className="bi bi-cart me-2"></i>
            Novo Pedido
          </h1>

          <form onSubmit={handleSubmit}>
            {/* Seção de Ingressos */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-ticket-perforated me-2"></i>
                  Ingressos
                </h5>
              </div>
              <div className="card-body">
                {ingressosDisponiveis.length === 0 ? (
                  <div className="alert alert-warning">
                    Nenhum ingresso disponível. Venda ingressos primeiro nas sessões.
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Selecione Ingressos:</label>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Tipo</th>
                              <th>Valor</th>
                              <th>Sessão ID</th>
                              <th>Ação</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ingressosDisponiveis.map((ingresso) => (
                              <tr key={ingresso.id}>
                                <td>
                                  <span className={`badge ${ingresso.tipo === 'Inteira' ? 'bg-primary' : 'bg-success'}`}>
                                    {ingresso.tipo}
                                  </span>
                                </td>
                                <td>R$ {ingresso.valorFinal.toFixed(2)}</td>
                                <td>{ingresso.sessaoId}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleAdicionarIngresso(ingresso)}
                                  >
                                    <i className="bi bi-plus-circle me-1"></i>
                                    Adicionar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {ingressosSelecionados.length > 0 && (
                      <div className="mt-3">
                        <h6>Ingressos Selecionados:</h6>
                        <ul className="list-group">
                          {ingressosSelecionados.map((ingresso, index) => (
                            <li key={`${ingresso.id}-${index}`} className="list-group-item d-flex justify-content-between align-items-center">
                              <div>
                                <span className={`badge ${ingresso.tipo === 'Inteira' ? 'bg-primary' : 'bg-success'} me-2`}>
                                  {ingresso.tipo}
                                </span>
                                R$ {ingresso.valorFinal.toFixed(2)} - Sessão {ingresso.sessaoId}
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoverIngresso(index)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Seção de Lanches */}
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-bag me-2"></i>
                  Lanches
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowLancheForm(!showLancheForm)}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Novo Combo
                </button>
              </div>
              <div className="card-body">
                {showLancheForm && (
                  <div className="card mb-3 border-primary">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">Criar Novo Combo</h6>
                    </div>
                    <div className="card-body">
                      <div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <Input
                              id="nome"
                              name="nome"
                              type="text"
                              placeholder="Nome do combo"
                              value={lancheFormData.nome}
                              onChange={handleLancheFormChange}
                              hasError={!!errors.nome}
                            />
                            {errors.nome && (
                              <div className="text-danger small mt-1">{errors.nome}</div>
                            )}
                          </div>
                          <div className="col-md-6 mb-3">
                            <Input
                              id="valorUnitario"
                              name="valorUnitario"
                              type="number"
                              placeholder="Valor unitário"
                              value={lancheFormData.valorUnitario}
                              onChange={handleLancheFormChange}
                              hasError={!!errors.valorUnitario}
                            />
                            {errors.valorUnitario && (
                              <div className="text-danger small mt-1">{errors.valorUnitario}</div>
                            )}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="descricao" className="form-label">Descrição</label>
                          <textarea
                            id="descricao"
                            name="descricao"
                            className={`form-control ${errors.descricao ? 'is-invalid' : ''}`}
                            placeholder="Descrição do combo"
                            value={lancheFormData.descricao}
                            onChange={handleLancheFormChange}
                            rows={2}
                          />
                          {errors.descricao && (
                            <div className="text-danger small mt-1">{errors.descricao}</div>
                          )}
                        </div>
                        <div className="mb-3">
                          <Input
                            id="qtUnidade"
                            name="qtUnidade"
                            type="number"
                            placeholder="Quantidade"
                            value={lancheFormData.qtUnidade}
                            onChange={handleLancheFormChange}
                            hasError={!!errors.qtUnidade}
                          />
                          {errors.qtUnidade && (
                            <div className="text-danger small mt-1">{errors.qtUnidade}</div>
                          )}
                        </div>
                        <div className="d-flex gap-2">
                          <Button 
                            type="button" 
                            label="Criar Combo" 
                            variant="primary" 
                            onClick={() => {
                              handleCriarLanche();
                            }}
                          />
                          <Button
                            type="button"
                            label="Cancelar"
                            variant="secondary"
                            onClick={() => setShowLancheForm(false)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {lanchesDisponiveis.length === 0 ? (
                  <div className="alert alert-info">
                    Nenhum combo disponível. Crie um novo combo acima.
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Selecione Combos:</label>
                      <div className="row">
                        {lanchesDisponiveis.map((lanche) => (
                          <div key={lanche.id} className="col-md-6 mb-2">
                            <div className="card">
                              <div className="card-body">
                                <h6 className="card-title">{lanche.nome}</h6>
                                <p className="card-text small">{lanche.descricao}</p>
                                <p className="card-text">
                                  <strong>R$ {lanche.valorUnitario.toFixed(2)}</strong>
                                  <small className="text-muted ms-2">
                                    x{lanche.qtUnidade} = R$ {lanche.subtotal.toFixed(2)}
                                  </small>
                                </p>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                    console.log('Botão clicado! Adicionando lanche:', lanche.nome);
                                    handleAdicionarLanche(lanche);
                                    console.log('Função handleAdicionarLanche chamada');
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                  }}
                                >
                                  <i className="bi bi-plus-circle me-1"></i>
                                  Adicionar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3">
                      <h6>Lanches Selecionados ({lanchesSelecionados.length}):</h6>
                      {lanchesSelecionados.length === 0 ? (
                        <div className="alert alert-secondary">
                          <small>Nenhum lanche adicionado ainda.</small>
                        </div>
                      ) : (
                        <ul className="list-group">
                          {lanchesSelecionados.map((lanche, index) => (
                            <li key={`lanche-${lanche.id}-${index}`} className="list-group-item d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{lanche.nome}</strong> - {lanche.descricao}
                                <br />
                                <small className="text-muted">
                                  R$ {lanche.valorUnitario.toFixed(2)} x {lanche.qtUnidade} = R$ {(lanche.subtotal || lanche.valorUnitario * lanche.qtUnidade).toFixed(2)}
                                </small>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemoverLanche(index);
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Resumo */}
            <div className="card mb-4 border-success">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-calculator me-2"></i>
                  Resumo do Pedido
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>Ingressos Inteira:</strong> {calcularQuantidades().qtInteira}
                    </p>
                    <p>
                      <strong>Ingressos Meia:</strong> {calcularQuantidades().qtMeia}
                    </p>
                    <p>
                      <strong>Total de Ingressos:</strong> {ingressosSelecionados.length}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Total de Lanches:</strong> {lanchesSelecionados.length}
                    </p>
                    <h4 className="text-success">
                      <strong>Valor Total: R$ {valorTotal.toFixed(2)}</strong>
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Button type="submit" label="Criar Pedido" variant="primary" />
              <Button
                type="button"
                label="Cancelar"
                variant="secondary"
                onClick={() => navigate('/pedidos')}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

