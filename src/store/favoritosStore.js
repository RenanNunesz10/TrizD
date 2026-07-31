import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export const useFavoritosStore = create((set, get) => ({
  favoritos: [], // Vai guardar apenas os IDs dos produtos favoritados

  // Busca os favoritos do banco quando o cliente entra no site
  carregarFavoritos: async (userId) => {
    if (!userId) {
      set({ favoritos: [] });
      return;
    }
    const { data } = await supabase
      .from('favoritos')
      .select('produto_id')
      .eq('user_id', userId);
      
    if (data) {
      set({ favoritos: data.map((f) => f.produto_id) });
    }
  },

  // Adiciona ou remove o favorito
  toggleFavorito: async (userId, produtoId) => {
    if (!userId) return false; // Proteção extra

    const { favoritos } = get();
    const jaFavoritado = favoritos.includes(produtoId);

    if (jaFavoritado) {
      // Remove do banco e da tela
      await supabase.from('favoritos').delete().match({ user_id: userId, produto_id: produtoId });
      set({ favoritos: favoritos.filter((id) => id !== produtoId) });
    } else {
      // Adiciona no banco e na tela
      await supabase.from('favoritos').insert([{ user_id: userId, produto_id: produtoId }]);
      set({ favoritos: [...favoritos, produtoId] });
    }
    return true;
  }
}));