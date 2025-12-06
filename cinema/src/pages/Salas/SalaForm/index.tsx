import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salaService } from '../../../services/salaService';
import { salaSchema } from '../../../schemas/salaSchema';
import type { SalaFormData } from '../../../schemas/salaSchema';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';

export const SalaForm = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<SalaFormData>({
    numero: 0,
    capacidade: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value),
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
      const validatedData = salaSchema.parse(formData);
      await salaService.create(validatedData);
      navigate('/salas');
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
        const errorMessage = error.response.data?.message || error.response.statusText || 'Erro ao cadastrar sala';
        alert(`Erro: ${errorMessage}`);
        console.error('Erro da API:', error.response.data);
      } else if (error.request) {
        alert('Erro: Não foi possível conectar ao servidor. Verifique se o json-server está rodando na porta 3000.');
        console.error('Erro de conexão:', error.request);
      } else {
        alert(`Erro: ${error.message || 'Erro desconhecido ao cadastrar sala'}`);
        console.error('Erro:', error);
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="mb-4">
            <i className="bi bi-door-open me-2"></i>
            Cadastrar Sala
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Input
                id="numero"
                name="numero"
                type="number"
                placeholder="Número da sala"
                value={formData.numero}
                onChange={handleChange}
                hasError={!!errors.numero}
              />
              {errors.numero && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.numero}
                </div>
              )}
            </div>

            <div className="mb-3">
              <Input
                id="capacidade"
                name="capacidade"
                type="number"
                placeholder="Capacidade máxima de público"
                value={formData.capacidade}
                onChange={handleChange}
                hasError={!!errors.capacidade}
              />
              {errors.capacidade && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.capacidade}
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <Button type="submit" label="Cadastrar" variant="primary" />
              <Button
                type="button"
                label="Cancelar"
                variant="secondary"
                onClick={() => navigate('/salas')}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

