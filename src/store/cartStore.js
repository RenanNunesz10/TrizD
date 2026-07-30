import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      cart: [],
      isCartOpen: false,

      addToCart: (produto) => 
        set((state) => ({
          cart: [...state.cart, produto]
        })),

      removeFromCart: (produtoId) => 
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== produtoId)
        })),

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
    }),
    {
      name: 'loja-3d-carrinho', // Nome da chave salva no navegador
      partialize: (state) => ({ cart: state.cart }), // Salva apenas a lista do carrinho (não a gaveta aberta/fechada)
    }
  )
);