import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pedidoService } from '../../../services/pedidoService';
import type { Pedido } from '../../../models/Pedido';

export const PedidosList = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      const data = await pedidoService.getAll();
      setPedidos(data);
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

  const handleDelete = async (id: number | string) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        await pedidoService.delete(id);
        loadPedidos();
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
        <Link to="/pedidos/novo" className="btn btn-primary">
          <i className="bi bi-sliders me-2"></i>
          Gerenciar Combos
        </Link>
      </div>

      {pedidos.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Nenhum pedido cadastrado ainda.
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
                        </small>
                      </li>
                      <li>
                        <small className="text-muted">
                          Meia: {pedido.qtMeia}
                        </small>
                      </li>
                      <li>
                        <small className="text-muted">
                          Total: {pedido.ingresso.length} ingresso(s)
                        </small>
                      </li>
                    </ul>
                  </div>
                  <div className="mb-2">
                    <p className="mb-1">
                      <strong>
                        <i className="bi bi-bag me-1"></i>
                        Lanches:
                      </strong>
                    </p>
                    <small className="text-muted ms-3">
                      {pedido.lanche.length} combo(s)
                    </small>
                  </div>
                  <div className="mt-3">
                    <h6 className="text-primary">
                      <i className="bi bi-currency-dollar me-1"></i>
                      Valor Total: R$ {pedido.valorTotal.toFixed(2)}
                    </h6>
                  </div>
                </div>
                <div className="card-footer">
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
        </div>
      )}
    </div>
  );
};

