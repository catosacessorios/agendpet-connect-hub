
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserType } from "@/hooks/use-user-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const cadastroSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  petshopName: z.string().min(1, "Nome do pet shop é obrigatório"),
  userType: z.enum(["admin", "cliente"], {
    required_error: "Por favor, selecione o tipo de usuário",
  }),
});

type CadastroFormData = z.infer<typeof cadastroSchema>;

const Cadastro = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { updateUserType } = useUserType();
  const [loading, setLoading] = useState(false);

  const form = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      email: "",
      password: "",
      petshopName: "",
      userType: "admin",
    },
  });

  const handleCadastro = async (data: CadastroFormData) => {
    if (loading) return;
    setLoading(true);

    try {
      await signUp(data.email, data.password, data.petshopName);
      // Após o registro, atualizar o tipo de usuário
      await updateUserType(data.userType);
      
      toast.success("Conta criada com sucesso! Faça login para continuar.");
      
      // Redirecionar para a página de login apropriada
      if (data.userType === "cliente") {
        navigate("/cliente/login");
      } else {
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">AgendPet</h1>
          <p className="text-gray-600 mt-2">Crie sua conta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
            <CardDescription>
              Crie uma conta para começar a usar o sistema
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCadastro)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de Usuário</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="admin" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Sou um Pet Shop
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="cliente" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Sou um Cliente
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
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
                      <FormDescription>
                        Mínimo de 6 caracteres
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="petshopName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch("userType") === "admin" 
                          ? "Nome do Pet Shop" 
                          : "Nome Completo"
                        }
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={form.watch("userType") === "admin" 
                            ? "Nome do seu Pet Shop" 
                            : "Seu nome completo"
                          }
                          {...field}
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
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>

                <p className="mt-4 text-center text-sm text-gray-600">
                  Já tem uma conta?{" "}
                  <Link 
                    to={form.watch("userType") === "cliente" ? "/cliente/login" : "/login"} 
                    className="text-primary hover:underline"
                  >
                    Faça login
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

export default Cadastro;
