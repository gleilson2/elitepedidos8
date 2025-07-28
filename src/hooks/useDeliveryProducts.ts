import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface DeliveryProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price?: number;
  description: string;
  image_url?: string;
  is_active: boolean;
  is_weighable: boolean;
  price_per_gram?: number;
  complement_groups?: any;
  sizes?: any;
  scheduled_days?: any;
  availability_type?: string;
  created_at: string;
  updated_at: string;
}

export const useDeliveryProducts = () => {
  const [products, setProducts] = useState<DeliveryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Carregando produtos do delivery...');
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl === 'your_supabase_url_here' || 
          supabaseKey === 'your_supabase_anon_key_here' ||
          supabaseUrl.includes('placeholder')) {
        console.warn('⚠️ Supabase não configurado - usando produtos de demonstração');
        
        // Produtos de demonstração
        const demoProducts: DeliveryProduct[] = [
          {
            id: 'demo-acai-300',
            name: 'Açaí 300ml',
            category: 'acai',
            price: 15.90,
            description: 'Açaí tradicional 300ml',
            image_url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
            is_active: true,
            is_weighable: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-acai-500',
            name: 'Açaí 500ml',
            category: 'acai',
            price: 22.90,
            description: 'Açaí tradicional 500ml',
            image_url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
            is_active: true,
            is_weighable: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        setProducts(demoProducts);
        setLoading(false);
        return;
      }

      // Set timeout for the query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Consulta demorou mais de 10 segundos')), 10000);
      });

      const queryPromise = supabase
        .from('delivery_products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) throw error;
      
      setProducts(data || []);
      console.log(`✅ ${data?.length || 0} produtos carregados do banco`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produtos';
      console.error('❌ Erro ao carregar produtos:', errorMessage);
      setError(errorMessage);
      
      // Fallback para produtos de demonstração
      const demoProducts: DeliveryProduct[] = [
        {
          id: 'demo-acai-300',
          name: 'Açaí 300ml',
          category: 'acai',
          price: 15.90,
          description: 'Açaí tradicional 300ml',
          image_url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
          is_active: true,
          is_weighable: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setProducts(demoProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (product: Omit<DeliveryProduct, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('delivery_products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => [...prev, data]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar produto');
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<DeliveryProduct>) => {
    try {
      const { data, error } = await supabase
        .from('delivery_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar produto');
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('delivery_products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao excluir produto');
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch
  };
};