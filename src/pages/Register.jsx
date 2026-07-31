import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  
  const signUp = useAuthStore((state) => state.signUp);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    
    try {
      await signUp(email, senha, nome);
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login'); 
    } catch (error) {
      toast.error('Erro ao criar conta. Esse e-mail já pode estar em uso.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Criar Nova Conta</h2>
      
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
          <input 
            type="text" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha (mínimo 6 caracteres)</label>
          <input 
            type="password" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors cursor-pointer disabled:bg-gray-400 mt-4"
        >
          {loading ? 'Criando conta...' : 'Cadastrar'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Já tem uma conta?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-semibold">
          Faça login aqui
        </Link>
      </div>
    </div>
  );
}