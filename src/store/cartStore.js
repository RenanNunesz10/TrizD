import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      
      // A PEÇA QUE FALTAVA PARA O BOTÃO DA NAVBAR FUNCIONAR:
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      addToCart: (product) => {
        const cart = get().cart;
        
        // Verifica se o item já existe no carrinho com o MESMO ID E a MESMA COR
        const existingIndex = cart.findIndex(
          (item) => item.id === product.id && item.cor_escolhida === product.cor_escolhida
        );

        if (existingIndex > -1) {
          const newCart = [...cart];
          newCart[existingIndex].quantidade = (newCart[existingIndex].quantidade || 1) + (product.quantidade || 1);
          set({ cart: newCart, isOpen: true });
        } else {
          set({ cart: [...cart, { ...product, quantidade: product.quantidade || 1 }], isOpen: true });
        }
      },

      removeFromCart: (index) => {
        const newCart = get().cart.filter((_, i) => i !== index);
        set({ cart: newCart });
      },

      updateQuantity: (index, quantidade) => {
        if (quantidade <= 0) {
          get().removeFromCart(index);
          return;
        }
        const newCart = [...get().cart];
        newCart[index].quantidade = quantidade;
        set({ cart: newCart });
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);