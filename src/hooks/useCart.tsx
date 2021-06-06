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
      const updatedCart = [...cart]; // imutabilit using original cart
      const productExists = updatedCart.find(prod => prod.id === productId); // get the obj and change it.

      const stock = await api.get(`/stock/${productId}`);
      
      const stockProdAmount = stock.data.amount;
      const currentAmount = productExists ? productExists.amount : 0; // check if the obj exists on the returned obj.
      const amount = currentAmount + 1;

      // if fails on this checking, thus should return a message saying out of stock.
      if(amount > stockProdAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      // we will check if the product exists on cart, if so: must update the amount, else:
      // must get product from api and add amount = 1 to create this item in cart.
      if(productExists){
        productExists.amount = amount
        console.log(productExists.amount);
        
      } else {
        const newItem = await api.get(`/products/${productId}`);

        const newItemAmount = {
          ...newItem.data,
          amount: 1
        };

        updatedCart.push(newItemAmount);
      }
      // perpetuating item in cart by setting on state and saving item on localStorage.
      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Erro na adição do produto'); // if any error occur during api checking, retuns new message to users.
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart];

      const removeItem = updatedCart.findIndex(product => product.id === productId);

      if(removeItem >0) {
        updatedCart.splice(removeItem, 1);
        setCart(updatedCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      } else {
        throw Error()
      }
    } catch {
      
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
