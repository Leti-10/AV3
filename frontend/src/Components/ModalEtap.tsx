import { useState, useEffect } from 'react';
import api from '../services/api';
import '../Styles/Aero.css';

interface ModalProps {
  onClose: () => void;
  onSave: (nova: any) => void;
}

interface Aeronave {
  codigo: string;
  modelo: string;
}

interface Funcionario {
  id: number;
  nome: string;
}

function ModalEtapa({ onClose, onSave }: ModalProps) {
  const [listaAeronaves, setListaAeronaves] = useState<Aeronave[]>([]);
  const [listaFuncionarios, setListaFuncionarios] = useState<Funcionario[]>([]);
  const [nome, setNome] = useState('');
  const [prazo, setPrazo] = useState('');
  const [status, setStatus] = useState('Pendente');
  const [aeronaveSelecionada, setAeronaveSelecionada] = useState('');
  const [funcionariosSelecionados, setFuncionariosSelecionados] = useState<number[]>([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resAero, resFunc] = await Promise.all([
          api.get('/aeronavesList'),
          api.get('/funcionariosList')
        ]);
        setListaAeronaves(resAero.data);
        setListaFuncionarios(resFunc.data);
      } catch (error) {
        console.error("Erro ao carregar listas:", error);
      }
    }
    carregarDados();
  }, []);

  const toggleFuncionario = (id: number) => {
    setFuncionariosSelecionados(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!aeronaveSelecionada) {
      alert("Selecione uma aeronave!");
      return;
    }

    const novaEtapa = {
      nome,
      dataPrevista: prazo,
      aeronaveId: aeronaveSelecionada, 
      funcionarioIds: funcionariosSelecionados,
      status
    };

    onSave(novaEtapa);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>x</button>
        <h3>Cadastrar Nova Etapa</h3>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="nome">Nome da Etapa</label>
            <input 
              id="nome" 
              type="text" 
              placeholder="Ex: Montagem da Fuselagem" 
              value={nome}
              onChange={e => setNome(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="prazo">Prazo de Conclusão</label>
            <input 
              id="prazo" 
              type="date" 
              value={prazo}
              onChange={e => setPrazo(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="aeronave">Aeronave Vinculada</label>
            <select 
              id="aeronave" 
              value={aeronaveSelecionada}
              onChange={e => setAeronaveSelecionada(e.target.value)}
              required
            >
              <option value="">Selecione uma aeronave...</option>
              {listaAeronaves.map(aero => (
                <option key={aero.codigo} value={aero.codigo}>
                  {aero.modelo} (Cód: {aero.codigo})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Responsáveis (Selecione um ou mais)</label>
            <div className="checkbox-list-container">
              {listaFuncionarios.length === 0 ? (
                <p style={{fontSize: '12px', color: '#666'}}>Nenhum funcionário cadastrado.</p>
              ) : (
                listaFuncionarios.map(func => (
                  <div key={func.id} className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id={`func-${func.id}`}
                      checked={funcionariosSelecionados.includes(func.id)}
                      onChange={() => toggleFuncionario(func.id)}
                    />
                    <label htmlFor={`func-${func.id}`}>{func.nome}</label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status da Etapa</label>
            <select 
              id="status" 
              value={status}
              onChange={e => setStatus(e.target.value)}
              required
            >
              <option value="Pendente">Pendente</option>
              <option value="Em_andamento">Em Andamento</option>
              <option value="Concluido">Concluída</option>
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

export default ModalEtapa;