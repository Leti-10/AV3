import { useState, useEffect } from 'react';
import { PiArrowsClockwiseBold } from "react-icons/pi";
import ModalPeca from '../Components/ModalPeca';
import api from '../services/api';
import '../Styles/Aero.css';

interface Peca {
  id: number;
  nome: string;
  fornecedor: string;
  tipo: 'Nacional' | 'Importada';
  status: 'Em_producao' | 'Em_transporte' | 'Pronta_para_uso';
  aeronaveId: string;
  aeronave?: {
    modelo: string;
  };
}

const cicloProducao = ['Em_producao', 'Em_transporte', 'Pronta_para_uso'];

function Pecas() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarPecas();
  }, []);

  const carregarPecas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pecasList');
      setPecas(response.data);
    } catch (error) {
      console.error("Erro ao buscar peças:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      'Em_producao': 'Em Produção',
      'Em_transporte': 'Em Transporte',
      'Pronta_para_uso': 'Pronta'
    };
    return map[status] || status;
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'Pronta_para_uso': return 'status-pill pronta';
      case 'Em_producao': return 'status-pill producao';
      case 'Em_transporte': return 'status-pill transporte';
      default: return 'status-pill';
    }
  };

  const mudarStatus = async (peca: Peca) => {
    const currentIndex = cicloProducao.indexOf(peca.status);
  
    if (currentIndex === 2 || currentIndex === -1) return;

    const novoStatus = cicloProducao[currentIndex + 1];

    try {
      await api.put('/pecaEdit', {
        id: peca.id,
        status: novoStatus
      });
      await carregarPecas();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert('Erro ao atualizar status da peça.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gerenciamento de Peças</h1>
        <button onClick={() => setIsModalOpen(true)}>+ Cadastrar Peça</button>
      </div>

      {loading ? (
        <p>Carregando peças...</p>
      ) : (
        <div className="aeronaves-grid">
          {pecas.map((peca) => (
            <div className="aeronave-card" key={peca.id}>
              <h2>{peca.nome}</h2>
              <p><strong>Código:</strong> {peca.id}</p>
              <p><strong>Fornecedor:</strong> {peca.fornecedor}</p>
              <p><strong>Tipo:</strong> {peca.tipo}</p>
              {peca.aeronave && (
                <p style={{fontSize: '0.85rem', color: '#666'}}>
                  Vinculado a: {peca.aeronave.modelo}
                </p>
              )}

              <div className="status-container">
                <span className={getStatusClass(peca.status)}>
                  {formatStatus(peca.status)}
                </span>
                
                <button
                  onClick={() => mudarStatus(peca)}
                  className={`mudar-btn ${peca.status === 'Pronta_para_uso' ? 'disabled' : ''}`}
                  disabled={peca.status === 'Pronta_para_uso'}
                  title={
                    peca.status === 'Pronta_para_uso'
                      ? 'Peça finalizada'
                      : 'Avançar para o próximo status'
                  }
                >
                  <PiArrowsClockwiseBold />
                </button>
              </div>
            </div>
          ))}
          
          {pecas.length === 0 && !loading && (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>
              Nenhuma peça cadastrada.
            </p>
          )}
        </div>
      )}

      {isModalOpen && (
        <ModalPeca 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={carregarPecas}
        />
      )}
    </div>
  );
}

export default Pecas;