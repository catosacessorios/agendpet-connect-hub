
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Configuracoes = () => {
  const { petshopProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [petshopData, setPetshopData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    logo_url: ""
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (petshopProfile?.id) {
      fetchPetshopDetails();
    }
  }, [petshopProfile]);

  const fetchPetshopDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("petshops")
        .select("*")
        .eq("id", petshopProfile?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setPetshopData({
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          description: data.description || "",
          logo_url: data.logo_url || ""
        });
        
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      }
    } catch (error) {
      console.error("Error fetching petshop details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePetshopData = async () => {
    try {
      setLoading(true);
      
      if (!petshopData.name) {
        toast.error("Nome do petshop é obrigatório");
        return;
      }

      const { error } = await supabase
        .from("petshops")
        .update({
          name: petshopData.name,
          address: petshopData.address || null,
          phone: petshopData.phone || null,
          email: petshopData.email || null,
          description: petshopData.description || null
        })
        .eq("id", petshopProfile?.id);
        
      if (error) throw error;
      
      toast.success("Informações salvas com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar informações");
      console.error("Error updating petshop:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        toast.error("Todos os campos são obrigatórios");
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }
      
      // Change password through Supabase Auth
      const { error } = await supabase.auth.updateUser({ 
        password: passwordData.newPassword 
      });
      
      if (error) throw error;
      
      toast.success("Senha alterada com sucesso!");
      
      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar senha");
      console.error("Error changing password:", error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    try {
      setUploadingLogo(true);
      const file = e.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("O arquivo deve ter no máximo 2MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("O arquivo deve ser uma imagem");
        return;
      }
      
      // Create a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `petshop-logos/${fileName}`;
      
      // Create a URL for preview
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      
      // Upload the file to storage bucket
      // Note: This would require setting up a storage bucket in Supabase
      // For now, we'll just simulate the upload and update the logo_url
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update petshop with the new logo URL
      const { error } = await supabase
        .from("petshops")
        .update({
          logo_url: previewUrl // In production, this should be the actual URL from storage
        })
        .eq("id", petshopProfile?.id);
        
      if (error) throw error;
      
      setPetshopData({
        ...petshopData,
        logo_url: previewUrl
      });
      
      toast.success("Logo atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer upload do logo");
      console.error("Error uploading logo:", error);
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <DashboardLayout title="Configurações">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Perfil do Petshop</TabsTrigger>
          <TabsTrigger value="password">Senha</TabsTrigger>
          <TabsTrigger value="subscription">Assinatura</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Petshop</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-full sm:w-32 h-32 relative">
                      <div className="w-32 h-32 rounded-md border overflow-hidden flex items-center justify-center bg-gray-50">
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center text-gray-500 text-xs p-2">
                            Sem logo
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">Logo do Petshop</label>
                      <Input 
                        type="file"
                        accept="image/*" 
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Formatos recomendados: JPG, PNG. Tamanho máximo: 2MB
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome do Petshop *</label>
                    <Input 
                      value={petshopData.name}
                      onChange={(e) => setPetshopData({...petshopData, name: e.target.value})}
                      placeholder="Nome do seu petshop"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea 
                      value={petshopData.description}
                      onChange={(e) => setPetshopData({...petshopData, description: e.target.value})}
                      placeholder="Descreva brevemente o seu petshop"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endereço</label>
                    <Input 
                      value={petshopData.address}
                      onChange={(e) => setPetshopData({...petshopData, address: e.target.value})}
                      placeholder="Endereço completo"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefone</label>
                      <Input 
                        value={petshopData.phone}
                        onChange={(e) => setPetshopData({...petshopData, phone: e.target.value})}
                        placeholder="(99) 99999-9999"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email de Contato</label>
                      <Input 
                        type="email"
                        value={petshopData.email}
                        onChange={(e) => setPetshopData({...petshopData, email: e.target.value})}
                        placeholder="contato@seupetshop.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSavePetshopData}
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Senha Atual</label>
                  <Input 
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="Digite sua senha atual"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nova Senha</label>
                  <Input 
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Digite sua nova senha"
                  />
                  <p className="text-xs text-gray-500">A senha deve ter pelo menos 6 caracteres</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirme a Nova Senha</label>
                  <Input 
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Digite novamente sua nova senha"
                  />
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={handleChangePassword}
                    disabled={loading}
                  >
                    {loading ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Plano e Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-primary/10 border border-primary/30 p-6 rounded-lg text-center">
                  <h3 className="font-medium text-lg mb-2">Plano Atual: <span className="font-bold">Gratuito</span></h3>
                  <p className="text-gray-600 mb-4">Aproveite os recursos básicos para gerenciar seu petshop.</p>
                  <Button>
                    Atualizar para Premium
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Plano Gratuito</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Até 50 clientes
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Agendamentos básicos
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Cadastro de serviços
                        </li>
                        <li className="flex items-center">
                          <span className="text-red-500 mr-2">✗</span>
                          <span className="text-gray-500">Lembretes por email</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-red-500 mr-2">✗</span>
                          <span className="text-gray-500">Relatórios avançados</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary">
                    <CardHeader className="pb-2 bg-primary/5">
                      <CardTitle className="text-base flex items-center">
                        Plano Premium
                        <span className="ml-2 bg-primary text-white text-xs py-0.5 px-2 rounded-full">
                          Recomendado
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Clientes ilimitados
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Agendamentos avançados
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Lembretes por email
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Relatórios detalhados
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Suporte prioritário
                        </li>
                      </ul>
                      <Button className="w-full mt-4">
                        R$ 79,90 / mês
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Plano Empresarial</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Tudo do plano Premium
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Múltiplas unidades
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          API personalizada
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Integrações avançadas
                        </li>
                      </ul>
                      <Button variant="outline" className="w-full mt-4">
                        Contate-nos
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Configuracoes;
