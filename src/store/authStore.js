import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export const useAuthStore = create((set) => ({
  user: null,
  perfil: null, // Aqui guardaremos se é admin ou cliente
  carregando: true,

  // Função para logar
  login: async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (error) throw error;
    return data;
  },

  // Função para deslogar
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, perfil: null });
  },

  // Função que roda ao abrir o site para ver se já tem alguém logado
  checkUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Se achou o usuário, busca se ele é admin ou cliente na tabela perfis
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