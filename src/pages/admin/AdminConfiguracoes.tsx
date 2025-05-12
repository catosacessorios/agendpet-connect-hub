
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type PetshopDataType = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
}

const AdminConfiguracoes = () => {
  const { petshopProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PetshopDataType>({
    name: "",
    email: null,
    phone: null,
    address: null,
    description: null
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
      toast.error("Erro ao carregar dados do pet shop");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petshopProfile?.id) {
      toast.error("Erro ao identificar o pet shop");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from("petshops")
        .update(formData)
        .eq("id", petshopProfile.id);

      if (error) throw error;
      toast.success("Configurações atualizadas com sucesso");
    } catch (error: any) {
      console.error("Erro ao atualizar configurações:", error);
      toast.error(error.message || "Erro ao atualizar configurações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Configurações">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Configurações do Pet Shop</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Pet Shop</Label>
              <Input
                id="name"
                name="name"
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
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AdminLayout>
  );
};

export default AdminConfiguracoes;
