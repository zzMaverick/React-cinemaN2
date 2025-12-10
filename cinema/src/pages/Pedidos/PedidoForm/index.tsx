import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lancheComboService } from '../../../services/lancheComboService';
import type { LancheCombo } from '../../../models/LancheCombo';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { lancheComboSchema } from '../../../schemas/lancheComboSchema';
import type { LancheComboFormData } from '../../../schemas/lancheComboSchema';

export const PedidoForm = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lanchesDisponiveis, setLanchesDisponiveis] = useState<LancheCombo[]>([]);
  const [showLancheForm, setShowLancheForm] = useState(false);
  const [lancheFormData, setLancheFormData] = useState<LancheComboFormData>({
    nome: '',
    descricao: '',
    valorUnitario: 0,
    qtUnidade: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const lanches = await lancheComboService.getAll();
        setLanchesDisponiveis(lanches);
      } catch (error: any) {
        console.error('Erro ao carregar combos:', error);
        alert('Erro ao carregar combos. Verifique se o servidor está rodando.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
      setLancheFormData({
        nome: '',
        descricao: '',
        valorUnitario: 0,
        qtUnidade: 1,
      });
      setShowLancheForm(false);
      alert('Combo criado com sucesso!');
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
        alert('Erro ao criar combo. Tente novamente.');
      }
    }
  };

  const handleExcluirLanche = async (id?: number | string) => {
    if (!id) return;
    if (!window.confirm('Tem certeza que deseja excluir este combo?')) return;
    try {
      await lancheComboService.delete(id);
      setLanchesDisponiveis(prev => prev.filter(l => String(l.id) !== String(id)));
      alert('Combo excluído com sucesso!');
    } catch (error) {
      alert('Erro ao excluir combo.');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Carregando...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <h1 className="mb-4">
            <i className="bi bi-sliders me-2"></i>
            Gerenciar Combos
          </h1>

          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-bag me-2"></i>
                Combos Disponíveis
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
                        <div className="alert alert-info mt-2">
                          <strong>Total do combo:</strong> R$ {(Number(lancheFormData.valorUnitario || 0) * Number(lancheFormData.qtUnidade || 0)).toFixed(2)}
                        </div>
                      </div>
                      {/* Campo de estoque removido para não exigir no cadastro */}
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
                              x{lanche.qtUnidade} = R$ {(lanche.subtotal || lanche.valorUnitario * lanche.qtUnidade).toFixed(2)}
                            </small>
                          </p>
                          <p className="card-text">
                            <small className="text-muted">Disponíveis: {lanche.qtDisponivel}</small>
                          </p>
                        </div>
                        <div className="card-footer d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleExcluirLanche(lanche.id)}
                          >
                            <i className="bi bi-trash me-1"></i>
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <Button
                type="button"
                label="Voltar"
                variant="secondary"
                onClick={() => navigate('/pedidos')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

