import { create } from 'zustand';

export const useCartStore = create((set) => ({
  // Estado inicial: o carrinho começa como uma lista (array) vazia
  cart: [],

  // Ação para adicionar um produto
  addToCart: (produto) => set((state) => ({
    cart: [...state.cart, produto]
  })),

  // Ação para remover um produto pelo ID
  removeFromCart: (produtoId) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== produtoId)
  })),
}));