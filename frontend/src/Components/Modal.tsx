import { useState } from 'react';
import api from '../services/api'; 
import '../Styles/Aero.css';

interface ModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function ModalAeronave({ onClose, onSuccess }: ModalProps) {
  const [codigo, setCodigo] = useState('');
  const [modelo, setModelo] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [tipo, setTipo] = useState('Comercial');
  const [alcance, setAlcance] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        codigo: codigo, 
        modelo: modelo,
        tipo: tipo, 
        capacidade: Number(capacidade),
        alcance: Number(alcance) 
      };

      await api.post('/aeronave', payload);

      onSuccess(); 
      onClose();   
    } catch (error: any) {
      console.error(error);
      if (error.response?.data?.error) {
        alert("Erro: " + error.response.data.error);
      } else {
        alert("Erro ao cadastrar. Verifique se o Código já existe.");
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>Cadastrar Nova Aeronave</h3>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="codigo">Código da Aeronave </label>
            <input 
              id="codigo" 
              type="text" 
              placeholder="Ex: A-101" 
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="modelo">Modelo</label>
            <input 
              id="modelo" 
              type="text" 
              placeholder="Ex: Embraer E195-E2" 
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="capacidade">Capacidade (Passageiros)</label>
            <input 
              id="capacidade" 
              type="number" 
              placeholder="Ex: 132" 
              min="1" 
              value={capacidade}
              onChange={(e) => setCapacidade(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipo">Tipo da Aeronave</label>
            <select 
              id="tipo" 
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
            >
              <option value="Comercial">Comercial</option>
              <option value="Militar">Militar</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="alcance">Alcanc (pés)</label>
            <input 
              id="alcance" 
              type="number"   
              placeholder="Ex: 4800" 
              min="0" 
              value={alcance}
              onChange={(e) => setAlcance(e.target.value)}
              required 
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalAeronave;