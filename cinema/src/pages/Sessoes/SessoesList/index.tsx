import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sessaoService } from '../../../services/sessaoService';
import type { SessaoCompleta } from '../../../models/Sessao';
import { VenderIngressoModal } from '../VenderIngressoModal';

export const SessoesList = () => {
  const [sessoes, setSessoes] = useState<SessaoCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessao, setSelectedSessao] = useState<SessaoCompleta | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadSessoes();
  }, []);

  const loadSessoes = async () => {
    try {
      const data = await sessaoService.getAll();
      setSessoes(data);
    } catch (error: any) {
      console.error('Erro ao carregar sessões:', error);
      if (error.request) {
        alert('Erro: Não foi possível conectar ao servidor. Verifique se o json-server está rodando na porta 3000.');
      } else {
        alert('Erro ao carregar sessões. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVenderIngresso = (sessao: SessaoCompleta) => {
    setSelectedSessao(sessao);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSessao(null);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-center mt-5">Carregando...</div>;
  }

  return (
    <>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <i className="bi bi-calendar-event me-2"></i>
            Sessões
          </h1>
          <Link to="/sessoes/novo" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nova Sessão
          </Link>
        </div>

        {sessoes.length === 0 ? (
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Nenhuma sessão agendada ainda.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Filme</th>
                  <th>Sala</th>
                  <th>Data e Horário</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sessoes.map((sessao) => (
                  <tr key={sessao.id}>
                    <td>
                      <i className="bi bi-film me-2"></i>
                      {sessao.filme?.titulo || 'N/A'}
                    </td>
                    <td>
                      <i className="bi bi-door-open me-2"></i>
                      Sala {sessao.sala?.numero || 'N/A'}
                    </td>
                    <td>
                      <i className="bi bi-clock me-2"></i>
                      {formatDateTime(sessao.horarioExibicao)}
                    </td>
                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleVenderIngresso(sessao)}
                      >
                        <i className="bi bi-ticket-perforated me-1"></i>
                        Vender Ingresso
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSessao && (
        <VenderIngressoModal
          sessao={selectedSessao}
          show={showModal}
          onClose={handleCloseModal}
          onSuccess={loadSessoes}
        />
      )}
    </>
  );
};

