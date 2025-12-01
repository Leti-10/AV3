import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/login', { 
        email: email, 
        password: senha 
      });
      if (response.data.login) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Email ou senha inválidos.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>AEROCODE</h1>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-login">
            Entrar
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;