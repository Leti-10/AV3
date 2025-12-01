import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import api from "../services/api"; 
import '../Styles/dashboard.css';

function Dashboard() {

  const [totalAeronaves, setTotalAeronaves] = useState(0);
  const [totalPecas, setTotalPecas] = useState(0);
  const [aeronavesPorTipo, setAeronavesPorTipo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRelatorios, setTotalRelatorios] = useState(0);

  const producaoData = [
    { mes: "Jan", pecas: 120, prazo: 95 },
    { mes: "Fev", pecas: 98, prazo: 80 },
    { mes: "Mar", pecas: 135, prazo: 92 },
    { mes: "Abr", pecas: 150, prazo: 88 },
    { mes: "Mai", pecas: 175, prazo: 93 },
  ];

  const testesData = [
    { mes: "Jan", aprovados: 15, reprovados: 3 },
    { mes: "Fev", aprovados: 18, reprovados: 2 },
    { mes: "Mar", aprovados: 14, reprovados: 4 },
    { mes: "Abr", aprovados: 20, reprovados: 1 },
    { mes: "Mai", aprovados: 22, reprovados: 2 },
    { mes: "Jun", aprovados: 19, reprovados: 5 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    async function carregarStats() {
      try {
        const response = await api.get('/dashboard/stats');
        const { totalAeronaves, totalPecas, totalRelatorios, aeronavesPorTipo } = response.data;

        setTotalAeronaves(totalAeronaves);
        setTotalPecas(totalPecas);
        setTotalRelatorios(totalRelatorios);

        const graficoPizza = aeronavesPorTipo.map((item: any) => ({
          name: item.tipo,
          value: item._count.tipo
        }));
        
        setAeronavesPorTipo(graficoPizza);

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarStats();
  }, []);

  return (
    <div className="page-container dashboard-page">
      <h1>Visão Geral</h1>
      <p>Bem-vindo ao sistema Aerocode</p>
      
      {loading ? <p>Carregando indicadores...</p> : (
        <>
          <div className="cards-container">
            <div className="card">
              <h3>Total de Aeronaves</h3>
              <p className="valor">{totalAeronaves}</p>
            </div>
            <div className="card">
              <h3>Peças em Estoque/Uso</h3>
              <p className="valor">{totalPecas}</p>
            </div>
            <div className="card">
              <h3>Prazo Médio Cumprido</h3>
              <p className="valor">91%</p> 
            </div>
            <div className="card">
              <h3>Relatórios Emitidos</h3>
              <p className="valor">{totalRelatorios}</p>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-box">
              <h3>Peças Produzidas (Meta)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={producaoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pecas" fill="#3498db" name="Peças" />
                  <Bar dataKey="prazo" fill="#2ecc71" name="Prazo (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h3>Frota por Tipo (Real)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={aeronavesPorTipo}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {aeronavesPorTipo.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-box">
            <h3>Testes de Qualidade (Histórico)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={testesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="aprovados" stroke="#2ecc71" name="Aprovados" />
                <Line type="monotone" dataKey="reprovados" stroke="#e74c3c" name="Reprovados" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;