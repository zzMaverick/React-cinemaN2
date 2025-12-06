import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filmeService } from '../../../services/filmeService';
import { filmeSchema } from '../../../schemas/filmeSchema';
import type { FilmeFormData } from '../../../schemas/filmeSchema';
import { Genero } from '../../../models/Filme';
import type { Genero as GeneroType } from '../../../models/Filme';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';

export const FilmeForm = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FilmeFormData>({
    titulo: '',
    sinopse: '',
    classificacao: '',
    duracao: 0,
    elenco: '',
    genero: Genero.ACAO,
    dataInicioExibicao: '',
    dataFinalExibicao: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duracao' ? (value === '' ? 0 : Number(value)) : value,
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

    try {
      const validatedData = filmeSchema.parse(formData);
      await filmeService.create({
        ...validatedData,
        genero: validatedData.genero as GeneroType,
      });
      navigate('/filmes');
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
        const errorMessage = error.response.data?.message || error.response.statusText || 'Erro ao cadastrar filme';
        alert(`Erro: ${errorMessage}`);
        console.error('Erro da API:', error.response.data);
      } else if (error.request) {
        alert('Erro: Não foi possível conectar ao servidor. Verifique se o json-server está rodando na porta 3000.');
        console.error('Erro de conexão:', error.request);
      } else {
        alert(`Erro: ${error.message || 'Erro desconhecido ao cadastrar filme'}`);
        console.error('Erro:', error);
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="mb-4">
            <i className="bi bi-film me-2"></i>
            Cadastrar Filme
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Input
                id="titulo"
                name="titulo"
                type="text"
                placeholder="Digite o título do filme"
                value={formData.titulo}
                onChange={handleChange}
                hasError={!!errors.titulo}
              />
              {errors.titulo && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.titulo}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="sinopse" className="form-label">Sinopse</label>
              <textarea
                id="sinopse"
                name="sinopse"
                className={`form-control ${errors.sinopse ? 'is-invalid' : ''}`}
                placeholder="Digite a sinopse do filme"
                value={formData.sinopse}
                onChange={handleChange}
                rows={4}
              />
              {errors.sinopse && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.sinopse}
                </div>
              )}
            </div>

            <div className="mb-3">
              <Input
                id="classificacao"
                name="classificacao"
                type="text"
                placeholder="Ex: Livre, 12 anos, 16 anos, 18 anos"
                value={formData.classificacao}
                onChange={handleChange}
                hasError={!!errors.classificacao}
              />
              {errors.classificacao && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.classificacao}
                </div>
              )}
            </div>

            <div className="mb-3">
              <Input
                id="duracao"
                name="duracao"
                type="number"
                placeholder="Duração em minutos"
                value={formData.duracao}
                onChange={handleChange}
                hasError={!!errors.duracao}
              />
              {errors.duracao && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.duracao}
                </div>
              )}
            </div>

            <div className="mb-3">
              <Input
                id="elenco"
                name="elenco"
                type="text"
                placeholder="Digite o elenco do filme"
                value={formData.elenco}
                onChange={handleChange}
                hasError={!!errors.elenco}
              />
              {errors.elenco && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.elenco}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="genero" className="form-label">Gênero</label>
              <select
                id="genero"
                name="genero"
                className={`form-select ${errors.genero ? 'is-invalid' : ''}`}
                value={formData.genero}
                onChange={handleChange}
              >
                {(Object.values(Genero) as string[]).map((genero) => (
                  <option key={genero} value={genero}>
                    {genero}
                  </option>
                ))}
              </select>
              {errors.genero && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.genero}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="dataInicioExibicao" className="form-label">Data de Início de Exibição</label>
              <input
                id="dataInicioExibicao"
                name="dataInicioExibicao"
                type="date"
                className={`form-control ${errors.dataInicioExibicao ? 'is-invalid' : ''}`}
                value={formData.dataInicioExibicao}
                onChange={handleChange}
              />
              {errors.dataInicioExibicao && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.dataInicioExibicao}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="dataFinalExibicao" className="form-label">Data Final de Exibição</label>
              <input
                id="dataFinalExibicao"
                name="dataFinalExibicao"
                type="date"
                className={`form-control ${errors.dataFinalExibicao ? 'is-invalid' : ''}`}
                value={formData.dataFinalExibicao}
                onChange={handleChange}
              />
              {errors.dataFinalExibicao && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.dataFinalExibicao}
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <Button type="submit" label="Cadastrar" variant="primary" />
              <Button
                type="button"
                label="Cancelar"
                variant="secondary"
                onClick={() => navigate('/filmes')}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

