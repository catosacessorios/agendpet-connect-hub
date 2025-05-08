
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";

const Cadastro = () => {
  const [formData, setFormData] = useState({
    nomePetshop: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validar se as senhas são iguais
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não conferem!");
      setIsLoading(false);
      return;
    }
    
    // Simulando um cadastro (aqui você integraria com Supabase)
    setTimeout(() => {
      console.log("Cadastro:", formData);
      toast.success("Cadastro realizado com sucesso!");
      setIsLoading(false);
      
      // Simular login após cadastro
      localStorage.setItem("user", JSON.stringify({ email: formData.email, name: formData.nomePetshop }));
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Crie sua conta</CardTitle>
            <CardDescription className="text-center">
              Comece a usar o AgendPet gratuitamente
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomePetshop">Nome do Petshop</Label>
                <Input 
                  id="nomePetshop" 
                  name="nomePetshop"
                  placeholder="Petshop Exemplo" 
                  value={formData.nomePetshop}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="seupetshop@exemplo.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  placeholder="********" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password" 
                  placeholder="********" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Ao se cadastrar, você concorda com nossos{" "}
                <Link to="/termos" className="text-primary-500 hover:underline">
                  Termos de Serviço
                </Link>{" "}
                e{" "}
                <Link to="/privacidade" className="text-primary-500 hover:underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>
              <div className="text-center text-sm">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                  Faça login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Cadastro;
