import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessaoService } from '../../../services/sessaoService';
import { filmeService } from '../../../services/filmeService';
import { salaService } from '../../../services/salaService';
import { sessaoSchema } from '../../../schemas/sessaoSchema';
import type { SessaoFormData } from '../../../schemas/sessaoSchema';
import type { Filme } from '../../../models/Filme';
import type { Sala } from '../../../models/Sala';
import { Button } from '../../../components/Button';

export const SessaoForm = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    horarioExibicao: '',
    filmeId: '',
    salaId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [filmesData, salasData] = await Promise.all([
        filmeService.getAll(),
        salaService.getAll(),
      ]);
      setFilmes(filmesData);
      setSalas(salasData);
      if (salasData.length === 0) {
        alert('Atenção: Nenhuma sala cadastrada. Cadastre uma sala antes de agendar uma sessão.');
      }
      if (filmesData.length === 0) {
        alert('Atenção: Nenhum filme cadastrado. Cadastre um filme antes de agendar uma sessão.');
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (error.request) {
        alert('Erro: Não foi possível conectar ao servidor. Verifique se o json-server está rodando na porta 3000.');
      } else {
        alert('Erro ao carregar dados. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.filmeId || formData.filmeId === '') {
      setErrors({ filmeId: 'Selecione um filme' });
      return;
    }
    
    if (!formData.salaId || formData.salaId === '') {
      setErrors({ salaId: 'Selecione uma sala' });
      return;
    }

    try {
      const filmeIdNum = Number(formData.filmeId);
      const salaIdNum = Number(formData.salaId);
      
      let dataToValidate;
      if (!isNaN(filmeIdNum) && !isNaN(salaIdNum) && filmeIdNum > 0 && salaIdNum > 0) {
        dataToValidate = {
          horarioExibicao: formData.horarioExibicao,
          filmeId: filmeIdNum,
          salaId: salaIdNum,
        };
        const validatedData = sessaoSchema.parse(dataToValidate);
        await sessaoService.create(validatedData);
      } else {
        dataToValidate = {
          horarioExibicao: formData.horarioExibicao,
          filmeId: formData.filmeId as any,
          salaId: formData.salaId as any,
        };
        await sessaoService.create(dataToValidate);
      }
      navigate('/sessoes');
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
        const errorMessage = error.response.data?.message || error.response.statusText || 'Erro ao agendar sessão';
        alert(`Erro: ${errorMessage}`);
        console.error('Erro da API:', error.response.data);
      } else if (error.request) {
        alert('Erro: Não foi possível conectar ao servidor. Verifique se o json-server está rodando na porta 3000.');
        console.error('Erro de conexão:', error.request);
      } else {
        alert(`Erro: ${error.message || 'Erro desconhecido ao agendar sessão'}`);
        console.error('Erro:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Carregando...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="mb-4">
            <i className="bi bi-calendar-event me-2"></i>
            Agendar Sessão
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="filmeId" className="form-label">Filme</label>
              <select
                id="filmeId"
                name="filmeId"
                className={`form-select ${errors.filmeId ? 'is-invalid' : ''}`}
                value={formData.filmeId}
                onChange={handleChange}
                disabled={filmes.length === 0}
              >
                <option value="">
                  {filmes.length === 0 ? 'Nenhum filme cadastrado' : 'Selecione um filme'}
                </option>
                {filmes.map((filme) => (
                  <option key={filme.id} value={String(filme.id || '')}>
                    {filme.titulo}
                  </option>
                ))}
              </select>
              {errors.filmeId && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.filmeId}
                </div>
              )}
              {filmes.length === 0 && (
                <div className="text-warning small mt-1">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Cadastre um filme primeiro antes de agendar uma sessão.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="salaId" className="form-label">Sala</label>
              <select
                id="salaId"
                name="salaId"
                className={`form-select ${errors.salaId ? 'is-invalid' : ''}`}
                value={formData.salaId}
                onChange={handleChange}
                disabled={salas.length === 0}
              >
                <option value="">
                  {salas.length === 0 ? 'Nenhuma sala cadastrada' : 'Selecione uma sala'}
                </option>
                {salas.map((sala) => (
                  <option key={sala.id} value={String(sala.id || '')}>
                    Sala {sala.numero} - {sala.capacidade} lugares
                  </option>
                ))}
              </select>
              {errors.salaId && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.salaId}
                </div>
              )}
              {salas.length === 0 && (
                <div className="text-warning small mt-1">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Cadastre uma sala primeiro antes de agendar uma sessão.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="horarioExibicao" className="form-label">Data e Horário</label>
              <input
                id="horarioExibicao"
                name="horarioExibicao"
                type="datetime-local"
                className={`form-control ${errors.horarioExibicao ? 'is-invalid' : ''}`}
                value={formData.horarioExibicao}
                onChange={handleChange}
              />
              {errors.horarioExibicao && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.horarioExibicao}
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <Button type="submit" label="Agendar" variant="primary" />
              <Button
                type="button"
                label="Cancelar"
                variant="secondary"
                onClick={() => navigate('/sessoes')}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

