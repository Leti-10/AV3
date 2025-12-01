import { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import ModalFuncionario from '../Components/ModalFunc';
import api from '../services/api';
import '../Styles/Aero.css';

interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
}

interface Telefone {
  ddd: string;
  numero: string;
}

interface Funcionario {
  id: number;
  nome: string;
  cargo: string;
  cpf: string;
  usuario: string;
  endereco?: Endereco;
  telefone?: Telefone;
}

interface FuncionarioForm {
  id?: number;
  nome: string;
  cpf: string;
  cargo: string;
  usuario: string;
  senha: string;
  endereco: Endereco;
  telefone: Telefone;
}

interface ModalDeleteProps {
  onClose: () => void;
  onConfirm: () => void;
  funcionarioNome: string;
}

function ModalDelete({ onClose, onConfirm, funcionarioNome }: ModalDeleteProps) {
  const [input, setInput] = useState('');
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '100%' }}
      >
        <button className="close-btn" onClick={onClose}>x</button>
        <h2>Confirmar Exclusão</h2>
        <p>Digite o nome do funcionário <strong>{funcionarioNome}</strong> para confirmar a exclusão.</p>
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Digite o nome aqui"
          style={{ width: '100%', padding: '8px', marginTop: '10px', marginBottom: '20px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={() => input === funcionarioNome && onConfirm()} 
            disabled={input !== funcionarioNome}
            style={{ padding: '8px 12px', backgroundColor: input === funcionarioNome ? '#d32f2f' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

function Func() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [funcSelecionado, setFuncSelecionado] = useState<FuncionarioForm | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; func?: Funcionario }>({ open: false });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    carregarFuncionarios();
    verificarPermissao();
  }, []);

  const verificarPermissao = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user.funcionario && user.funcionario.cargo === 'Administrador') {
        setIsAdmin(true);
      }
    }
  };

  const carregarFuncionarios = async () => {
    try {
      const response = await api.get('/funcionariosList');
      setFuncionarios(response.data);
    } catch (error) {
      console.error("Erro ao listar funcionários", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/funcionario/${id}`);
      carregarFuncionarios();
      setDeleteModal({ open: false });
    } catch (error) {
      alert("Erro ao excluir. Verifique se existem dependências.");
    }
  };

  const handleEdit = (func: Funcionario) => {
    const funcParaModal: FuncionarioForm = {
      id: func.id,
      nome: func.nome,
      cpf: func.cpf,
      cargo: func.cargo,
      usuario: func.usuario,
      senha: "",
      endereco: func.endereco || { cep: "", rua: "", numero: "", bairro: "", cidade: "" },
      telefone: func.telefone || { ddd: "", numero: "" }
    };
    setFuncSelecionado(funcParaModal);
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gerenciamento de Funcionários</h1>
        {isAdmin && (
          <button className="add-btn" onClick={() => setIsModalOpen(true)}>
            <FaPlus /> Cadastrar Funcionário
          </button>
        )}
      </div>

      <table className="funcionarios-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Cargo</th>
            <th>CPF</th>
            <th>Usuário</th>
            {isAdmin && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {funcionarios.map(f => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.nome}</td>
              <td>{f.cargo}</td>
              <td>{f.cpf}</td>
              <td>{f.usuario}</td>
              {isAdmin && (
                <td className="acoes">
                  <button className="btn-edit" onClick={() => handleEdit(f)}>
                    <FaEdit />
                  </button>
                  <button className="btn-delete" onClick={() => setDeleteModal({ open: true, func: f })}>
                    <FaTrash />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <ModalFuncionario
          onClose={() => {
            setIsModalOpen(false);
            setFuncSelecionado(null);
          }}
          onSuccess={carregarFuncionarios}
          funcionario={funcSelecionado ?? undefined}
        />
      )}

      {deleteModal.open && deleteModal.func && (
        <ModalDelete 
          funcionarioNome={deleteModal.func.nome}
          onClose={() => setDeleteModal({ open: false })}
          onConfirm={() => handleDelete(deleteModal.func!.id)}
        />
      )}
    </div>
  );
}

export default Func;
