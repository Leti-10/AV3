import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

interface Etapa {
  id: number;
  nome: string;
  status: string;
}

interface Peca {
  id: number;
  nome: string;
  status: string;
}

interface Aeronave {
  id: number;
  modelo: string;
  tipo: string;
  capacidade: number;
  alcance: string;
  etapas: Etapa[];
  pecas: Peca[];
}

function DetalhesAero() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('geral');
  const [aeronave, setAeronave] = useState<Aeronave | null>(null);

  const carregarAeronave = async () => {
    try {
      const res = await api.get(`/aeronaves/${id}`);
      const data = res.data;
      setAeronave({
        id: data.codigo,
        modelo: data.modelo,
        tipo: data.tipo,
        capacidade: data.capacidade,
        alcance: data.alcance,
        etapas: data.etapas.map((e: any) => ({ id: e.id, nome: e.nome, status: e.status })),
        pecas: data.pecas.map((p: any) => ({ id: p.id, nome: p.nome, status: p.status })),
      });
    } catch (error) {
      console.error('Erro ao carregar aeronave', error);
    }
  };

  useEffect(() => {
    if (id) carregarAeronave();
  }, [id]);

  if (!aeronave) return <p>Carregando...</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Detalhes da Aeronave: {aeronave.modelo}</h1>
        <Link to="/admin/aeronaves">{"< Voltar para a Lista"}</Link>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Geral</div>
        <div className={`tab ${activeTab === 'etapas' ? 'active' : ''}`} onClick={() => setActiveTab('etapas')}>Etapas</div>
        <div className={`tab ${activeTab === 'pecas' ? 'active' : ''}`} onClick={() => setActiveTab('pecas')}>Peças</div>
      </div>

      <div className="tab-content">
        {activeTab === 'geral' && (
          <div className="general-cards">
            <div className="general-card"><h4>Código</h4><p>{aeronave.id}</p></div>
            <div className="general-card"><h4>Tipo</h4><p>{aeronave.tipo}</p></div>
            <div className="general-card"><h4>Capacidade</h4><p>{aeronave.capacidade}</p></div>
            <div className="general-card"><h4>Alcance</h4><p>{aeronave.alcance}</p></div>
          </div>
        )}

        {activeTab === 'etapas' && (
          <div>
            <h3>Etapas de Produção</h3>
            <table className="data-table">
              <thead>
                <tr><th>Etapa</th><th>Status</th></tr>
              </thead>
              <tbody>
                {aeronave.etapas.map((etapa) => (
                  <tr key={etapa.id}>
                    <td>{etapa.nome}</td>
                    <td>{etapa.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'pecas' && (
          <div>
            <h3>Peças Associadas</h3>
            <table className="data-table">
              <thead><tr><th>ID Peça</th><th>Nome</th><th>Status</th></tr></thead>
              <tbody>
                {aeronave.pecas.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nome}</td>
                    <td>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetalhesAero;
