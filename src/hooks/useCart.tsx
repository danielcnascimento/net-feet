import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      /** -> Instructions
       * 
       * 1.Must set items on localStorage
       * 2.Must Check if Produc Exists
       * 3.If Product Exist -> update amount, if not -> add the item on Cart
       * 4.Must check if the desired amount exists on stock, if not,
       *   return a toast to users saying "cant add more, out of stcok!"
       * 5.Catch must have toat message "Error on adding product"
       */
      let updatedCart = [...cart]
      const cartExist = cart.find(cartItem => cartItem.id === productId);

      if(cartExist){
        const stock = await api.get<Stock>(`stock/${productId}`);
        const stockAmount = stock.data.amount;

        if(cartExist.amount > stockAmount) {
          toast.error('Quantidade solicitada fora de estoque');
          return
        }

        updatedCart = cart.map(cart =>{
        if(cart.id === productId){

          let updatedAmount = {...cart, amount: cart.amount + 1}
          return updatedAmount;
        }

        return cart;
        })
      } else {
        const product = await api.get<Product>(`products/${productId}`);
        updatedCart.push(product.data)
      }
      
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
