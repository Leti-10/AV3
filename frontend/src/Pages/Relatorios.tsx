import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import api from "../services/api";
import '../Styles/Aero.css';

interface Aeronave {
  codigo: string;
  modelo: string;
}

interface RelatorioResponse {
  titulo: string;
  dataGeracao: string;
  autor: string;
  status: string;
  dados?: {
    codigo: string;
    modelo: string;
    tipo: string;
    capacidade: number;
    alcance: number;
    pecas: any[];
    etapas: any[];
    testes: any[];
  };
}

function Relatorios() {
  const [listaAeronaves, setListaAeronaves] = useState<Aeronave[]>([]);
  const [aeronaveSelecionada, setAeronaveSelecionada] = useState("");
  const [historicoRelatorios, setHistoricoRelatorios] = useState<RelatorioResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/aeronavesList")
      .then((res) => setListaAeronaves(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/relatorios")
      .then((res) => setHistoricoRelatorios(res.data))
      .catch(() => {});
  }, []);

  const gerarPDF = (relatorio: RelatorioResponse) => {
    if (!relatorio.dados) return;
    const dados = relatorio.dados;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("AEROCODE - Relatório de Entrega", 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${new Date(relatorio.dataGeracao).toLocaleString()}`, 20, 30);
    doc.text(`Autorizado por: ${relatorio.autor}`, 20, 35);
    doc.setTextColor(0, 100, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`STATUS: ${relatorio.status}`, 20, 45);
    doc.setTextColor(0, 0, 0);

    doc.line(20, 50, 190, 50);

    doc.setFontSize(14);
    doc.text(`Aeronave: ${dados.modelo} (${dados.codigo})`, 20, 60);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Tipo: ${dados.tipo}`, 20, 70);
    doc.text(`Capacidade: ${dados.capacidade} passageiros`, 20, 80);
    doc.text(`Alcance/Autonomia: ${dados.alcance} km`, 20, 90);

    doc.line(20, 100, 190, 100);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo de Produção e Qualidade", 20, 110);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text(`- Total de Peças Instaladas: ${dados.pecas?.length || 0}`, 30, 120);
    doc.text(`- Etapas de Produção Concluídas: ${dados.etapas?.length || 0}`, 30, 130);
    doc.text(`- Testes de Qualidade Realizados: ${dados.testes?.length || 0}`, 30, 140);

    if (dados.testes?.length > 0) {
      doc.text("Últimos Testes:", 30, 155);
      dados.testes.forEach((t: any, index: number) => {
        const y = 165 + (index * 10);
        if (y < 280) {
          doc.text(`  * ${t.tipo}: ${t.resultado} (${new Date(t.data).toLocaleDateString()})`, 30, y);
        }
      });
    }

    doc.save(`Relatorio_Entrega_${dados.codigo}.pdf`);
  };

  const handleGerarRelatorio = async () => {
    if (!aeronaveSelecionada) {
      alert("Selecione uma aeronave primeiro!");
      return;
    }

    setLoading(true);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const nomeAutor = user.funcionario?.nome || "Sistema";

      const response = await api.post("/gerarRelatorio", {
        aeronaveId: aeronaveSelecionada,
        autor: nomeAutor
      });

      const novoRelatorio = response.data;
      setHistoricoRelatorios((prev) => [novoRelatorio, ...prev]);
      gerarPDF(novoRelatorio);
      alert("Relatório gerado e baixado com sucesso!");

    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        alert("⛔ BLOQUEIO :\n" + error.response.data.error);
      } else {
        alert("Erro ao conectar com o servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Relatórios de Entrega e Qualidade</h1>
      <p>Gerar documentação final para entrega da aeronave.</p>

      <div className="filter-card">
        <label>Aeronave:</label>
        <select
          value={aeronaveSelecionada}
          onChange={(e) => setAeronaveSelecionada(e.target.value)}
        >
          <option value="">Selecione...</option>
          {listaAeronaves.map((a) => (
            <option key={a.codigo} value={a.codigo}>
              {a.modelo} ({a.codigo})
            </option>
          ))}
        </select>

        <button 
          className="button-rel1"
          onClick={handleGerarRelatorio}
          disabled={loading}
        >
          {loading ? "Processando..." : "Validar e Gerar Relatório"}
        </button>
      </div>

      <div className="report-section">
        <h2>Relatórios Gerados</h2>

        {historicoRelatorios.length === 0 ? (
          <p style={{color: '#666', fontStyle: 'italic'}}>Nenhum relatório gerado nesta sessão.</p>
        ) : (
          <div className="report-card-list">
            {historicoRelatorios.map((rel, index) => (
              <div className="report-card" key={index}>
                <div className="report-card-header">
                  <h3>{rel.dados?.modelo || "Modelo Indefinido"}</h3>
                  <span>{new Date(rel.dataGeracao).toLocaleTimeString()}</span>
                </div>

                <div className="report-card-body">
                  <p><strong>Código:</strong> {rel.dados?.codigo || "—"}</p>
                  <p><strong>Status:</strong> <span style={{color: 'green', fontWeight: 'bold'}}>{rel.status}</span></p>
                  <p><strong>Autor:</strong> {rel.autor}</p>
                </div>

                <div className="report-card-footer">
                  <button
                    onClick={() => gerarPDF(rel)}
                    className="button-rel"
                    disabled={!rel.dados}
                  >
                    Baixar PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Relatorios;