
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserType } from "@/hooks/use-user-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória")
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { user, signIn, loading: authLoading } = useAuth();
  const { userType, loading: typeLoading } = useUserType();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  useEffect(() => {
    // Handle routing based on user type
    if (user && !authLoading && !typeLoading) {
      if (userType === 'admin') {
        navigate('/painel-administrador');
      } else if (userType === 'cliente') {
        navigate('/painel-cliente');
      } else if (userType === null) {
        // Type not set yet, redirect based on user role
        if (user.email === 'admin@example.com') {
          // This is a temporary check, replace with more robust role assignment
          navigate('/dashboard');
        } else {
          navigate('/cliente/dashboard');
        }
      }
    }
  }, [user, userType, authLoading, typeLoading, navigate]);

  const handleLogin = async (data: LoginFormData) => {
    if (loading) return;
    
    setLoading(true);
    console.log("Login form submitted:", data.email);

    try {
      await signIn(data.email, data.password);
      // Navigation handled in useEffect based on user type
    } catch (error: any) {
      console.error("Error in handleLogin:", error);
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  // If still checking authentication status, show loading state
  if (authLoading || (user && typeLoading)) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center p-4">
        <p className="text-gray-600">Verificando autenticação...</p>
      </div>
    );
  }

  // Don't show login if user is already logged in
  if (user) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center p-4">
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">AgendPet</h1>
          <p className="text-gray-600 mt-2">Acesse sua conta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com seus dados para acessar o sistema
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="seu@email.com" 
                          type="email"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <PasswordInput 
                          placeholder="********"
                          value={field.value}
                          onChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="flex flex-col">
                <Button
                  className="w-full"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>

                <p className="mt-4 text-center text-sm text-gray-600">
                  Não tem uma conta?{" "}
                  <Link to="/cadastro" className="text-primary hover:underline">
                    Cadastre-se
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
