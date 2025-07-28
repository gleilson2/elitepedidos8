import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DeliveryProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price?: number;
  description?: string;
  image_url?: string;
  is_active: boolean;
  is_weighable?: boolean;
  price_per_gram?: number;
  has_complements?: boolean;
  complement_groups?: any[];
  sizes?: any[];
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

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey ||
          supabaseUrl === 'your_supabase_url_here' ||
          supabaseKey === 'your_supabase_anon_key_here' ||
          supabaseUrl.includes('placeholder')) {
        console.warn('⚠️ Supabase not configured - using demo products for delivery');
        setProducts([
          {
            id: 'demo-delivery-acai-500g',
            name: 'Açaí 500g (Demo)',
            category: 'acai',
            price: 22.99,
            description: 'Açaí tradicional com 3 complementos grátis.',
            image_url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-delivery-combo-casal',
            name: 'Combo Casal (Demo)',
            category: 'combo',
            price: 49.99,
            description: '1kg de açaí + milkshake 300ml.',
            image_url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('delivery_products')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching delivery products';
      console.error('❌ Error fetching delivery products:', errorMessage);
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (product: Omit<DeliveryProduct, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('delivery_products')
        .insert([product])
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchProducts();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating delivery product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchProducts]);

  const updateProduct = useCallback(async (id: string, updates: Partial<DeliveryProduct>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('delivery_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchProducts();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating delivery product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('delivery_products')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting delivery product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};