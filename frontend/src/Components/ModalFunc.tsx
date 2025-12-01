import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import api from '../services/api'; 
import "../Styles/Aero.css";

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

interface ModalProps {
  onClose: () => void;
  onSuccess: () => void;
  funcionario?: FuncionarioForm;
}

const validarCPF = (cpf: string) => {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;
  return true;
};

function ModalFuncionario({ onClose, onSuccess, funcionario }: ModalProps) {
  const [form, setForm] = useState<FuncionarioForm>({
    id: funcionario?.id,
    nome: funcionario?.nome || "",
    cpf: funcionario?.cpf || "",
    cargo: funcionario?.cargo || "Operador",
    usuario: funcionario?.usuario || "",
    senha: funcionario?.senha || "",
    endereco: {
      cep: funcionario?.endereco?.cep || "",
      rua: funcionario?.endereco?.rua || "",
      numero: funcionario?.endereco?.numero || "",
      bairro: funcionario?.endereco?.bairro || "",
      cidade: funcionario?.endereco?.cidade || "",
    },
    telefone: {
      ddd: funcionario?.telefone?.ddd || "",
      numero: funcionario?.telefone?.numero || "",
    },
  });

  const aplicarMascara = (name: string, value: string) => {
    switch(name){
      case "cpf":
        value = value.replace(/\D/g, "").slice(0,11);
        value = value.replace(/(\d{3})(\d)/, "$1.$2")
                     .replace(/(\d{3})(\d)/, "$1.$2")
                     .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        break;
      case "endereco.cep":
        value = value.replace(/\D/g, "").slice(0,8).replace(/(\d{5})(\d)/, "$1-$2");
        break;
      case "telefone.numero":
        value = value.replace(/\D/g, "").slice(0,9);
        break;
      case "telefone.ddd":
        value = value.replace(/\D/g, "").slice(0,2);
        break;
      case "endereco.numero":
        value = value.replace(/\D/g, "").slice(0,5);
        break;
    }
    return value;
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [group, field] = name.split(".");
      const maskedValue = aplicarMascara(name, value);
      setForm(prev => ({
        ...prev,
        [group]: { ...prev[group as "endereco" | "telefone"], [field]: maskedValue },
      }));
      return;
    }
    const maskedValue = aplicarMascara(name, value);
    setForm(prev => ({ ...prev, [name]: maskedValue }));
  };

  const handleCepBlur = async () => {
    const cep = form.endereco.cep.replace(/\D/g, '');
    if (!cep) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) return;
      setForm(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          rua: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || ""
        }
      }));
    } catch {}
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validarCPF(form.cpf)) {
      alert("CPF inválido!");
      return;
    }
    const payload = {
      ...form,
      endereco: { ...form.endereco, numero: parseInt(form.endereco.numero) || 0 }
    };
    try {
      if (form.id) await api.put('/funcionarioEdit', payload);
      else await api.post('/funcionario', payload);
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.error || "Erro ao salvar funcionário.";
      alert("Erro: " + msg);
    }
  };

  useEffect(() => {
    setForm({
      id: funcionario?.id,
      nome: funcionario?.nome || "",
      cpf: funcionario?.cpf || "",
      cargo: funcionario?.cargo || "Operador",
      usuario: funcionario?.usuario || "",
      senha: funcionario?.senha || "",
      endereco: {
        cep: funcionario?.endereco?.cep || "",
        rua: funcionario?.endereco?.rua || "",
        numero: funcionario?.endereco?.numero || "",
        bairro: funcionario?.endereco?.bairro || "",
        cidade: funcionario?.endereco?.cidade || "",
      },
      telefone: {
        ddd: funcionario?.telefone?.ddd || "",
        numero: funcionario?.telefone?.numero || "",
      },
    });
  }, [funcionario]);

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <div 
        className="modal-content"
        onClick={e => e.stopPropagation()} 
        style={{ background: '#fff', padding: '20px', borderRadius: '8px', maxWidth: '500px', width: '100%' }}
      >
        <button className="close-btn" onClick={onClose}>x</button>
        <h2>{form.id ? "Editar Funcionário" : "Cadastrar Funcionário"}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Nome:</label>
          <input name="nome" value={form.nome} onChange={handleChange} required />

          <label>CPF:</label>
          <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" required maxLength={14} />

          <label>Cargo:</label>
          <select name="cargo" value={form.cargo} onChange={handleChange}>
            <option value="Administrador">Administrador</option>
            <option value="Engenheiro">Engenheiro</option>
            <option value="Operador">Operador</option>
          </select>

          <label>Email:</label> 
          <input name="usuario" value={form.usuario} onChange={handleChange} placeholder="ex: joao@gmail.com" required />

          <label>Senha:</label>
          <input name="senha" type="password" value={form.senha} onChange={handleChange} required />

          <h3 style={{marginTop: '20px', borderBottom: '1px solid #eee'}}>Endereço</h3>
          <label>CEP:</label>
          <input name="endereco.cep" value={form.endereco.cep} onChange={handleChange} onBlur={handleCepBlur} placeholder="00000-000" maxLength={9} />

          <label>Rua:</label>
          <input name="endereco.rua" value={form.endereco.rua} onChange={handleChange} required />

          <div style={{display: 'flex', gap: '15px', marginBottom: '10px'}}>
            <div style={{flex: '0 0 100px'}}>
              <label>Número:</label>
              <input name="endereco.numero" type="text" value={form.endereco.numero} onChange={handleChange} required maxLength={5} style={{width: '100%'}} />
            </div>
            <div style={{flex: 1}}>
              <label>Bairro:</label>
              <input name="endereco.bairro" value={form.endereco.bairro} onChange={handleChange} required style={{width: '100%'}} />
            </div>
          </div>

          <label>Cidade:</label>
          <input name="endereco.cidade" value={form.endereco.cidade} onChange={handleChange} required />

          <h3 style={{marginTop: '20px', borderBottom: '1px solid #eee'}}>Telefone</h3>
          <div style={{display: 'flex', gap: '15px'}}>
            <div style={{flex: '0 0 70px'}}>
              <label>DDD:</label>
              <input name="telefone.ddd" value={form.telefone.ddd} onChange={handleChange} placeholder="11" required maxLength={2} style={{width: '100%'}} />
            </div>
            <div style={{flex: 1}}>
              <label>Número:</label>
              <input name="telefone.numero" value={form.telefone.numero} onChange={handleChange} placeholder="999999999" required maxLength={9} style={{width: '100%'}} />
            </div>
          </div>

          <button type="submit" className="save-btn" style={{marginTop: '20px'}}>Salvar</button>
        </form>
      </div>
    </div>
  );
}

export default ModalFuncionario;
