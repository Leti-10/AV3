import { useState, useEffect } from 'react';
import api from '../services/api';
import '../Styles/Aero.css';

interface ModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Aeronave {
  codigo: number;
  modelo: string;
}

function ModalPeca({ onClose, onSuccess }: ModalProps) {
  const [nome, setNome] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [tipo, setTipo] = useState('Nacional');
  const [status, setStatus] = useState('Em_producao');
  const [aeronaveSelecionada, setAeronaveSelecionada] = useState('');
  const [listaAeronaves, setListaAeronaves] = useState<Aeronave[]>([]);

  useEffect(() => {
    async function carregarAeronaves() {
      try {
        const response = await api.get('/aeronavesList');
        setListaAeronaves(response.data);
      } catch (error) {
        console.error("Erro ao carregar aeronaves", error);
        alert("Erro ao carregar lista de aeronaves.");
      }
    }
    carregarAeronaves();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aeronaveSelecionada) {
      alert("Selecione uma aeronave para vincular a peça!");
      return;
    }

    try {
      await api.post('/peca', {
      nome,
      fornecedor,
      tipo,
      status,
      aeronaveId: aeronaveSelecionada
    });

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar peça. Verifique o console.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>x</button>
        <h3>Cadastrar Nova Peça</h3>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="nome">Nome da Peça</label>
            <input 
              id="nome" 
              type="text" 
              placeholder="Ex: Turbina T-1000" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="fornecedor">Fornecedor</label>
            <input 
              id="fornecedor" 
              type="text" 
              placeholder="Ex: GE Aviation" 
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="aeronave">Aeronave Vinculada</label>
            <select 
              id="aeronave" 
              value={aeronaveSelecionada} 
              onChange={(e) => setAeronaveSelecionada(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {listaAeronaves.map((aero) => (
                <option key={aero.codigo} value={aero.codigo}>
                  {aero.modelo} (Cód: {aero.codigo})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tipo">Tipo da Peça</label>
            <select 
              id="tipo" 
              value={tipo} 
              onChange={(e) => setTipo(e.target.value)}
              required
            >
              <option value="Nacional">Nacional</option>
              <option value="Importada">Importada</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status da Peça</label>
            <select 
              id="status" 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="Em_producao">Em Produção</option>
              <option value="Em_transporte">Em Transporte</option>
              <option value="Pronta_para_uso">Pronta</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalPeca;