import { useState, useEffect } from 'react';
import api from '../services/api';
import '../Styles/Aero.css';

interface ModalProps {
  onClose: () => void;
  onSuccess: () => void; 
}

interface Aeronave {
  codigo: string; 
  modelo: string;
}

interface Funcionario {
  id: number;
  nome: string;
}

function ModalTeste({ onClose, onSuccess }: ModalProps) {
  const [listaAeronaves, setListaAeronaves] = useState<Aeronave[]>([]);
  const [listaFuncionarios, setListaFuncionarios] = useState<Funcionario[]>([]);
  const [aeronaveId, setAeronaveId] = useState('');
  const [tipo, setTipo] = useState('Eletrico');
  const [resultado, setResultado] = useState('Reprovado');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]); 
  const [responsavelId, setResponsavelId] = useState('');

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
        console.error("Erro ao carregar listas", error);
      }
    }
    carregarDados();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aeronaveId) {
      alert("Selecione uma aeronave!");
      return;
    }

    try {
      await api.post('/teste', {
        aeronaveId: aeronaveId,
        tipo: tipo,
        resultado: resultado,
        data: new Date(data), 
        responsavelId: Number(responsavelId)
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert("Erro ao salvar teste. Verifique o console.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>Cadastrar Novo Teste</h3>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="idAero">Aeronave Vinculada</label>
            <select 
              id='idAero' 
              value={aeronaveId}
              onChange={e => setAeronaveId(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {listaAeronaves.map(aero => (
                <option key={aero.codigo} value={aero.codigo}>
                  {aero.modelo} ({aero.codigo})
                </option>
              ))}
            </select>
          </div>
            
          <div className="form-group">
            <label htmlFor="tipo">Tipo de Teste</label>
            <select 
              id="tipo" 
              value={tipo} 
              onChange={e => setTipo(e.target.value)} 
              required
            >
              <option value="Eletrico">Elétrico</option>
              <option value="Hidraulico">Hidráulico</option>
              <option value="Aerodinamico">Aerodinâmico</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="resultado">Resultado Inicial</label>
            <select 
              id="resultado" 
              value={resultado} 
              onChange={e => setResultado(e.target.value)} 
              required
            >
              <option value="Reprovado">Reprovado</option>
              <option value="Aprovado">Aprovado</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="data">Data</label>
            <input 
              id="data" 
              type="date" 
              value={data}
              onChange={e => setData(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="responsavel">Responsável</label>
            <select 
              id="responsavel" 
              value={responsavelId}
              onChange={e => setResponsavelId(e.target.value)}
              required
            >
              <option value="">Selecione um funcionário</option>
              {listaFuncionarios.map(func => (
                <option key={func.id} value={func.id}>
                  {func.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">Salvar Teste</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalTeste;