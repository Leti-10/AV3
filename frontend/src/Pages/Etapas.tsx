import { useState, useEffect } from "react";
import "../Styles/Aero.css";
import ModalEtapa from "../Components/ModalEtap";
import api from "../services/api";

interface Etapa {
  id: number;
  nome: string;
  dataPrevista: string;
  status: "Pendente" | "Em_andamento" | "Concluido";
  responsavel: string;
}

interface EtapasProps {
  aeronaveId?: string;
}

const statusMapFrontend = {
  Pendente: "Pendente",
  Em_andamento: "Em Andamento",
  Concluido: "Concluída",
} as const;

const getStatusClass = (status: Etapa["status"]) => {
  switch (status) {
    case "Concluido": return "status-concluida";
    case "Em_andamento": return "status-andamento";
    case "Pendente": return "status-pendente";
    default: return "";
  }
};

const formatarData = (dataString: string) => {
  if (!dataString) return "N/A";
  const date = new Date(dataString);
  return isNaN(date.getTime()) ? dataString : date.toLocaleDateString("pt-BR");
};

function Etapas({ aeronaveId }: EtapasProps) {
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const carregarEtapas = async () => {
    setLoading(true);
    try {
      const url = aeronaveId ? `/etapas/${aeronaveId}` : "/etapas";
      const res = await api.get(url);
      
      const dados = res.data.map((e: any) => ({
          id: e.id,
          nome: e.nome,
          dataPrevista: e.dataPrevista,
          status: e.status as Etapa["status"],
          responsavel: e.funcionarios?.map((f: any) => f.funcionario.nome).join(", ") || "Não definido",
        }));
      setEtapas(dados);
    } catch (err) {
      console.error("Erro ao carregar etapas", err);
    } finally {
      setLoading(false);
    }
  };

  const handleIniciar = async (id: number) => {
    try {
      await api.put("/etapaEdit", { id, status: "Em_andamento" });
      await carregarEtapas();
    } catch (err) {
      console.error("Erro ao iniciar etapa", err);
    }
  };

  const handleFinalizar = async (id: number) => {
    try {
      await api.put("/etapaEdit", { id, status: "Concluido" });
      await carregarEtapas();
    } catch (err) {
      console.error("Erro ao finalizar etapa", err);
    }
  };

  const handleAddEtapa = async (novaEtapa: any) => {
    try {
      const idFinal = novaEtapa.aeronaveId || aeronaveId;

      await api.post("/etapa", {
        nome: novaEtapa.nome,
        dataPrevista: novaEtapa.dataPrevista,
        status: "Pendente",
        aeronaveId: idFinal, 
        funcionarioIds: novaEtapa.funcionarioIds || [],
      });
      await carregarEtapas();
      setModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar nova etapa", err);
      alert("Erro ao criar etapa. Verifique se a Aeronave existe.");
    }
  };

  useEffect(() => {
    carregarEtapas();
  }, [aeronaveId]);

  const pendentes = etapas.filter(e => e.status === "Pendente");
  const andamento = etapas.filter(e => e.status === "Em_andamento");
  const concluidas = etapas.filter(e => e.status === "Concluido");

  const renderSection = (titulo: string, lista: Etapa[]) => (
    <div className="status-section">
      <h3 className="status-title">{titulo}</h3>

      {lista.length === 0 ? (
        <p className="empty">Nenhuma etapa aqui.</p>
      ) : (
        <div className="timeline-container">
          {lista
            .sort((a, b) => new Date(a.dataPrevista).getTime() - new Date(b.dataPrevista).getTime())
            .map((etapa, index) => (
              <div key={etapa.id} className="timeline-item">
                <div className={`timeline-dot ${getStatusClass(etapa.status)}`}></div>
                {index < lista.length - 1 && <div className="timeline-line"></div>}

                <div className={`etapa-card ${getStatusClass(etapa.status)}`}>
                  <h4>{etapa.nome}</h4>
                  <p>
                    <label>Status: </label>
                    <span className={getStatusClass(etapa.status)}>
                      {statusMapFrontend[etapa.status]}
                    </span>
                  </p>
                  <p>
                    <label>Previsão: </label>
                    {formatarData(etapa.dataPrevista)}
                  </p>
                  <p>
                    <label>Responsável: </label>
                    {etapa.responsavel}
                  </p>

                  <div className="etapa-actions">
                    {etapa.status === "Pendente" && (
                      <button className="ini" onClick={() => handleIniciar(etapa.id)}>
                        Iniciar Etapa
                      </button>
                    )}
                    {etapa.status === "Em_andamento" && (
                      <button className="fin" onClick={() => handleFinalizar(etapa.id)}>
                        Finalizar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container">
      <div className="details-main-panel">
        {modalOpen && (
          <ModalEtapa
            onClose={() => setModalOpen(false)}
            onSave={handleAddEtapa}
          />
        )}

        <div className="etapas-header">
          <h3>Gerenciamento de Etapas</h3>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            + Nova Etapa
          </button>
        </div>

        {loading ? (
          <p>Carregando etapas...</p>
        ) : (
          <>
            {renderSection("Pendentes", pendentes)}
            {renderSection("Em Andamento", andamento)}
            {renderSection("Concluídas", concluidas)}
          </>
        )}
      </div>
    </div>
  );
}

export default Etapas;