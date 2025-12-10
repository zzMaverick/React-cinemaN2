import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { lancheComboService } from '../../../services/lancheComboService';
import { lancheComboSchema } from '../../../schemas/lancheComboSchema';
import type { LancheCombo } from '../../../models/LancheCombo';
import type { LancheComboFormData } from '../../../schemas/lancheComboSchema';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';

type FormState = LancheComboFormData & { qtDisponivel?: number };

export const LancheComboForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(!!id);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormState>({
    nome: '',
    descricao: '',
    valorUnitario: 0,
    qtUnidade: 1,
    qtDisponivel: undefined,
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const combo: LancheCombo = await lancheComboService.getById(id);
        setFormData({
          nome: combo.nome,
          descricao: combo.descricao,
          valorUnitario: combo.valorUnitario,
          qtUnidade: combo.qtUnidade,
          qtDisponivel: combo.qtDisponivel,
        });
      } catch (error) {
        alert('Erro ao carregar combo para edição.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valorUnitario' || name === 'qtUnidade' || name === 'qtDisponivel' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const validated = lancheComboSchema.parse(formData);
      if (id) {
        await lancheComboService.update(id, validated);
        alert('Combo atualizado com sucesso!');
      } else {
        await lancheComboService.create(validated);
        alert('Combo criado com sucesso!');
      }
      navigate('/combos');
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
        alert(id ? 'Erro ao atualizar combo.' : 'Erro ao criar combo.');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Carregando...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="mb-4">
            <i className="bi bi-bag me-2"></i>
            {id ? 'Editar Combo' : 'Novo Combo'}
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Input
                id="nome"
                name="nome"
                type="text"
                placeholder="Nome do combo"
                value={formData.nome}
                onChange={handleChange}
                hasError={!!errors.nome}
              />
              {errors.nome && <div className="text-danger small mt-1">{errors.nome}</div>}
            </div>

            <div className="mb-3">
              <Input
                id="descricao"
                name="descricao"
                type="text"
                placeholder="Descrição"
                value={formData.descricao}
                onChange={handleChange}
                hasError={!!errors.descricao}
              />
              {errors.descricao && <div className="text-danger small mt-1">{errors.descricao}</div>}
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <Input
                  id="valorUnitario"
                  name="valorUnitario"
                  type="number"
                  placeholder="Valor unitário"
                  value={formData.valorUnitario}
                  onChange={handleChange}
                  hasError={!!errors.valorUnitario}
                />
                {errors.valorUnitario && <div className="text-danger small mt-1">{errors.valorUnitario}</div>}
              </div>
              <div className="col-md-4 mb-3">
                <Input
                  id="qtUnidade"
                  name="qtUnidade"
                  type="number"
                  placeholder="Quantidade por combo"
                  value={formData.qtUnidade}
                  onChange={handleChange}
                  hasError={!!errors.qtUnidade}
                />
                {errors.qtUnidade && <div className="text-danger small mt-1">{errors.qtUnidade}</div>}
              </div>
              <div className="col-md-4 mb-3">
                <Input
                  id="qtDisponivel"
                  name="qtDisponivel"
                  type="number"
                  placeholder="Unidades disponíveis (opcional)"
                  value={formData.qtDisponivel ?? ''}
                  onChange={handleChange}
                  hasError={!!errors.qtDisponivel}
                />
                {errors.qtDisponivel && <div className="text-danger small mt-1">{errors.qtDisponivel}</div>}
              </div>
            </div>

            <div className="alert alert-info">
              <strong>Total do combo:</strong>{' '}
              R$ {(Number(formData.valorUnitario || 0) * Number(formData.qtUnidade || 0)).toFixed(2)}
            </div>

            <div className="d-flex gap-2">
              <Button type="submit" label={id ? 'Salvar' : 'Criar'} variant="primary" />
              <Button type="button" label="Cancelar" variant="secondary" onClick={() => navigate('/combos')} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};