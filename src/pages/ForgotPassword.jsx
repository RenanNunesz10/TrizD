import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  
  const resetPassword = useAuthStore((state) => state.resetPassword);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await resetPassword(email);
      setEnviado(true);
      toast.success('Link de recuperação enviado para o seu e-mail!');
    } catch (error) {
      toast.error('Erro ao enviar o link. Verifique o e-mail digitado.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Recuperar Senha</h2>
      
      {enviado ? (
        <div className="text-center py-6">
          <p className="text-green-600 font-medium mb-4">
            Enviamos um link de recuperação para <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Verifique sua caixa de entrada e também a pasta de spam.
          </p>
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Voltar para o Login
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-600 text-center mb-6 text-sm">
            Digite o e-mail associado à sua conta e enviaremos um link para você criar uma nova senha.
          </p>
          <form onSubmit={handleReset} className="space-y-4">
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors cursor-pointer disabled:bg-blue-400 mt-2"
            >
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="text-gray-500 hover:text-gray-700 hover:underline">
              Voltar para o login
            </Link>
          </div>
        </>
      )}
    </div>
  );
}