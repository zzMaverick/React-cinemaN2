import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lancheComboService } from '../../../services/lancheComboService';
import type { LancheCombo } from '../../../models/LancheCombo';

export const LancheCombosList = () => {
  const [combos, setCombos] = useState<LancheCombo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await lancheComboService.getAll();
        setCombos(data);
      } catch (error: any) {
        console.error('Erro ao carregar combos:', error);
        if (error.request) {
          alert('Erro: Não foi possível conectar ao servidor. Verifique se o json-server está rodando.');
        } else {
          alert('Erro ao carregar combos. Tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Tem certeza que deseja excluir este combo?')) return;
    try {
      await lancheComboService.delete(id);
      setCombos(prev => prev.filter(c => String(c.id) !== String(id)));
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="bi bi-bag me-2"></i>
          Combos
        </h1>
        <Link to="/combos/novo" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Novo Combo
        </Link>
      </div>

      {combos.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Nenhum combo cadastrado ainda.
        </div>
      ) : (
        <div className="row">
          {combos.map(combo => (
            <div key={combo.id} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{combo.nome}</h5>
                  <p className="card-text small">{combo.descricao}</p>
                  <p className="card-text">
                    <strong>R$ {combo.valorUnitario.toFixed(2)}</strong>
                    <small className="text-muted ms-2">
                      x{combo.qtUnidade} = R$ {(combo.subtotal || combo.valorUnitario * combo.qtUnidade).toFixed(2)}
                    </small>
                  </p>
                  <p className="card-text">
                    <small className="text-muted">Disponíveis: {combo.qtDisponivel ?? combo.qtUnidade}</small>
                  </p>
                </div>
                <div className="card-footer d-flex gap-2">
                  <Link to={`/combos/${combo.id}/editar`} className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-pencil me-1"></i>
                    Editar
                  </Link>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(combo.id!)}>
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
  );
};