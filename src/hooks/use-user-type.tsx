
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type UserType = 'admin' | 'cliente' | null;

export const useUserType = () => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) {
        setUserType(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_types')
          .select('type')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user type:", error);
          setUserType(null);
        } else {
          setUserType(data?.type as UserType || null);
        }
      } catch (error) {
        console.error("Exception fetching user type:", error);
        setUserType(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserType();
  }, [user]);

  const updateUserType = async (type: UserType): Promise<boolean> => {
    if (!user || !type) return false;
    
    try {
      // Check if user type already exists
      const { data: existingData } = await supabase
        .from('user_types')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('user_types')
          .update({ type })
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_types')
          .insert({ user_id: user.id, type });
        
        if (error) throw error;
      }
      
      setUserType(type);
      return true;
    } catch (error) {
      console.error("Error updating user type:", error);
      return false;
    }
  };

  return {
    userType,
    loading,
    isAdmin: userType === 'admin',
    isCliente: userType === 'cliente',
    updateUserType
  };
};
