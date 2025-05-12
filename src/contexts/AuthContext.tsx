
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
    // Set up auth state listener FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || ""
          });
          
          // Use setTimeout to avoid potential deadlocks with Supabase auth
          setTimeout(() => {
            fetchPetshopProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
          setPetshopProfile(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    const fetchInitialSession = async () => {
      try {
        console.log("Fetching initial session");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Found existing session for:", session.user.email);
          setUser({
            id: session.user.id,
            email: session.user.email || ""
          });
          await fetchPetshopProfile(session.user.id);
        } else {
          console.log("No active session found");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching initial session:", error);
        setLoading(false);
      }
    };

    fetchInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPetshopProfile = async (userId: string) => {
    try {
      console.log("Fetching petshop profile for user:", userId);
      const { data, error } = await supabase
        .from("petshops")
        .select("id, name, logo_url")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching petshop profile:", error);
        return;
      }

      if (data) {
        console.log("Petshop profile loaded:", data.name);
        setPetshopProfile({
          id: data.id,
          name: data.name,
          logo_url: data.logo_url
        });
      } else {
        console.log("No petshop profile found for user");
      }
    } catch (error) {
      console.error("Error in fetchPetshopProfile:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Attempting to sign in:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error.message);
        throw error;
      }

      if (data.user) {
        console.log("Sign in successful for:", data.user.email);
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Sign in exception:", error);
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, petshopName: string) => {
    try {
      setLoading(true);
      console.log("Attempting to sign up:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            petshop_name: petshopName
          }
        }
      });

      if (error) {
        console.error("Sign up error:", error.message);
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
          console.error("Profile creation error:", profileError.message);
          throw profileError;
        }

        toast.success("Conta criada com sucesso! Faça login para continuar.");
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Sign up exception:", error);
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log("Signing out user");
      await supabase.auth.signOut();
      toast.success("Você saiu da sua conta");
      navigate("/login");
    } catch (error: any) {
      console.error("Sign out error:", error);
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
