import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalAeronave from '../Components/Modal'; 
import api from '../services/api'; 
import '../Styles/Aero.css';

interface Aeronave {
  codigo: number; 
  modelo: string;
  tipo: string;
}

function ListarAero() {
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    carregarAeronaves();
  }, []);

  const carregarAeronaves = async () => {
    setLoading(true);
    try {
      const response = await api.get('/aeronavesList');
      setAeronaves(response.data);
    } catch (error) {
      console.error("Erro ao buscar aeronaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (codigo: number) => {
    navigate(`/admin/aeronaves/${codigo}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gerenciamento de Aeronaves</h1>
        <button onClick={() => setIsModalOpen(true)}>+ Cadastrar Aeronave</button>
      </div>
      
      {loading ? (
        <p>Carregando lista...</p>
      ) : (
        <div className="aeronaves-grid">
          {aeronaves.map((aero) => (
            <div className="aeronave-card" key={aero.codigo}>
              <h2>{aero.modelo}</h2>
              <p><strong>Código:</strong> {aero.codigo}</p>
              <p><strong>Tipo:</strong> {aero.tipo}</p>

              <button 
                className="ver-detalhes-btn"
                onClick={() => handleViewDetails(aero.codigo)}
              >
                Ver Detalhes
              </button>
            </div>
          ))}

          {aeronaves.length === 0 && !loading && (
            <p style={{ gridColumn: "1/-1", textAlign: "center" }}>
              Nenhuma aeronave encontrada.
            </p>
          )}
        </div>
      )}

      {isModalOpen && (
        <ModalAeronave 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={carregarAeronaves} 
        />
      )}
    </div>
  );
}

export default ListarAero;