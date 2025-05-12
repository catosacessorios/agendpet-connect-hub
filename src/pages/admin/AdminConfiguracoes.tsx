
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type PetshopDataType = {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
}

const AdminConfiguracoes = () => {
  const { petshopProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PetshopDataType>({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: ""
  });

  useEffect(() => {
    if (petshopProfile) {
      // Fetch complete petshop data since the profile might not have all fields
      fetchPetshopData();
    }
  }, [petshopProfile]);

  const fetchPetshopData = async () => {
    if (!petshopProfile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("petshops")
        .select("*")
        .eq("id", petshopProfile.id)
        .single();
        
      if (error) throw error;
      
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        description: data.description || ""
      });
    } catch (error) {
      console.error("Error fetching petshop data:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!petshopProfile?.id) {
      toast.error("Perfil do Pet Shop não encontrado");
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("petshops")
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          description: formData.description
        })
        .eq("id", petshopProfile.id);
      
      if (error) throw error;
      
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar configurações:", error);
      toast.error(error.message || "Erro ao atualizar configurações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Configurações do Pet Shop">
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Pet Shop</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nome do seu Pet Shop"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email de Contato</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contato@seupetshop.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Rua, número, bairro, cidade"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Pet Shop</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descreva seu Pet Shop, horários de funcionamento, especialidades, etc."
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminConfiguracoes;
