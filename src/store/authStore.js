import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export const useAuthStore = create((set) => ({
  user: null,
  perfil: null,
  carregando: true,

  login: async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
    return data;
  },

  // NOVA FUNÇÃO: Cadastro
  signUp: async (email, senha, nome) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome } // Envia o nome para o nosso gatilho SQL capturar
      }
    });
    if (error) throw error;
    return data;
  },

  // NOVA FUNÇÃO: Recuperar Senha
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/atualizar-senha', // Para onde voltar após clicar no link do email
    });
    if (error) throw error;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, perfil: null });
  },

  checkUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: perfil } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', session.user.id)
        .single();
      set({ user: session.user, perfil: perfil, carregando: false });
    } else {
      set({ user: null, perfil: null, carregando: false });
    }
  }
}));