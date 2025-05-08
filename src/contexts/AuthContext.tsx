
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
};

type PetShopProfile = {
  id: string;
  name: string;
  logo_url?: string | null;
};

type AuthContextType = {
  user: User | null;
  petshopProfile: PetShopProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, petshopName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [petshopProfile, setPetshopProfile] = useState<PetShopProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || ""
          });
          await fetchPetshopProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || ""
          });
          await fetchPetshopProfile(session.user.id);
        } else {
          setUser(null);
          setPetshopProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPetshopProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("petshops")
        .select("id, name, logo_url")
        .eq("user_id", userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setPetshopProfile({
          id: data.id,
          name: data.name,
          logo_url: data.logo_url
        });
      }
    } catch (error) {
      console.error("Error fetching petshop profile:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, petshopName: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create petshop profile
        const { error: profileError } = await supabase.from("petshops").insert([
          {
            user_id: data.user.id,
            name: petshopName
          }
        ]);

        if (profileError) {
          throw profileError;
        }

        toast.success("Conta criada com sucesso! Faça login para continuar.");
        navigate("/login");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      navigate("/");
      toast.success("Você saiu da sua conta");
    } catch (error: any) {
      toast.error(error.message || "Erro ao sair");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, petshopProfile, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
