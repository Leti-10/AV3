import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ModalTeste from '../Components/ModalTeste';
import api from '../services/api';
import '../Styles/Aero.css';

interface Teste {
  id: number;
  tipo: string;
  data: string;
  resultado: 'Aprovado' | 'Reprovado';
  aeronaveId: string;
  responsavel?: string; 
  aeronave?: {
    modelo: string;
    codigo: string;
  };
}

function Testes() {
  const [testes, setTestes] = useState<Teste[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const colunas = ['Reprovado', 'Aprovado'];

  useEffect(() => {
    carregarTestes();
  }, []);

  const carregarTestes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/testesList');
      setTestes(response.data);
    } catch (error) {
      console.error("Erro ao carregar testes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Reprovado': return 'pill Reprovado';
      case 'Aprovado': return 'pill Aprovado';
      default: return 'pill';
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const onDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    if (source.droppableId === 'Reprovado' && destination.droppableId === 'Aprovado') {
      const novosTestes = testes.map((t) => 
        t.id === Number(draggableId) ? { ...t, resultado: 'Aprovado' as const } : t
      );
      setTestes(novosTestes);

      try {
        await api.put('/testeEdit', { 
            id: Number(draggableId), 
            resultado: 'Aprovado' 
        });
      } catch (error) {
        console.error("Erro ao salvar no banco:", error);
        alert("Erro de conexão. A mudança não foi salva.");
        carregarTestes();
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gerenciamento de Testes</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Cadastrar Teste</button>
      </div>

      {loading ? <p>Carregando testes...</p> : (
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {colunas.map((coluna) => (
            <Droppable droppableId={coluna} key={coluna}>
              {(provided: any, snapshot: any) => (
                <div
                  className={`kanban-column ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="kanban-column-header">
                    <h2>{coluna}</h2>
                  </div>
                  <div className="kanban-column-body">
                    {testes
                      .filter((teste) => teste.resultado === coluna)
                      .map((teste, index) => (
                        <Draggable
                          key={teste.id}
                          draggableId={String(teste.id)}
                          index={index}
                          isDragDisabled={coluna === 'Aprovado'}
                        >
                          {(provided: any) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="kanban-card"
                            >
                              <div className="kanban-card-top">
                                <span className={getStatusClass(teste.resultado)}>{teste.resultado}</span>
                                <span className="teste-id">#{teste.id}</span>
                              </div>
                              <h3 className="teste-tipo">{teste.tipo}</h3>
                              <p><strong>Aeronave:</strong> {teste.aeronave?.codigo || teste.aeronaveId}</p>
                              
                              <p><strong>Data:</strong> {formatDate(teste.data)}</p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      )}

      {isModalOpen && (
        <ModalTeste 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={carregarTestes} 
        />
      )}
    </div>
  );
}

export default Testes;