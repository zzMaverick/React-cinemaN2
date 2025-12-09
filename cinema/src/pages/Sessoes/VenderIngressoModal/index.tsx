import { useState } from 'react';
import { ingressoService } from '../../../services/ingressoService';
import { ingressoSchema } from '../../../schemas/ingressoSchema';
import type { IngressoFormData } from '../../../schemas/ingressoSchema';
import { TipoIngresso } from '../../../models/Ingresso';
import type { TipoIngresso as TipoIngressoType } from '../../../models/Ingresso';
import type { SessaoCompleta } from '../../../models/Sessao';
import { Button } from '../../../components/Button';

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
    sessaoId: Number(sessao.id) || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valorInteira' || name === 'valorMeia' || name === 'sessaoId'
        ? Number(value)
        : value,
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const calcularValorFinal = (tipo: TipoIngressoType): number => {
    return tipo === TipoIngresso.INTEIRA ? formData.valorInteira : formData.valorMeia;
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

      const dataToValidate = {
        ...formData,
        sessaoId: sessaoIdFinal,
      };

      const validatedData = ingressoSchema.parse(dataToValidate);
      
      const valorFinal = calcularValorFinal(validatedData.tipo as TipoIngressoType);
      
      const ingressoCriado = await ingressoService.create({
        ...validatedData,
        tipo: validatedData.tipo as TipoIngressoType,
        valorFinal,
      });
      
      const tipoIngressoTexto = validatedData.tipo === TipoIngresso.INTEIRA ? 'Inteira' : 'Meia';
      const filmeNome = sessao.filme?.titulo || 'N/A';
      const salaNumero = sessao.sala?.numero || 'N/A';
      const ingressoId = ingressoCriado.id || 'N/A';
      
      alert(`Ingresso ${tipoIngressoTexto} vendido com sucesso!\n\nID: ${ingressoId}\nValor: R$ ${valorFinal.toFixed(2)}\nSessão: ${filmeNome} - Sala ${salaNumero}`);
      
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
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
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
                <label htmlFor="tipo" className="form-label">Tipo de Ingresso</label>
                <select
                  id="tipo"
                  name="tipo"
                  className={`form-select ${errors.tipo ? 'is-invalid' : ''}`}
                  value={formData.tipo}
                  onChange={handleChange}
                >
                  <option value={TipoIngresso.INTEIRA}>Inteira</option>
                  <option value={TipoIngresso.MEIA}>Meia</option>
                </select>
                {errors.tipo && (
                  <div className="text-danger small mt-1">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.tipo}
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
                <strong>Valor Final:</strong> R${' '}
                {calcularValorFinal(formData.tipo as TipoIngressoType).toFixed(2)}
              </div>
            </div>
            <div className="modal-footer">
              <Button
                type="button"
                label="Cancelar"
                variant="secondary"
                onClick={onClose}
              />
              <Button type="submit" label="Confirmar Venda" variant="primary" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

