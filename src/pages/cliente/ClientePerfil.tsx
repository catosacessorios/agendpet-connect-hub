import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClienteLayout from "@/components/layout/ClienteLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCliente, Pet } from "@/hooks/use-cliente";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const perfilSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Telefone inválido").max(15, "Telefone inválido")
});

const petSchema = z.object({
  name: z.string().min(2, "Nome do pet deve ter pelo menos 2 caracteres"),
  species: z.string().min(1, "Espécie é obrigatória"),
  breed: z.string().optional(),
  age: z.string().transform((val) => val === "" ? null : Number(val)).optional(),
});

type PerfilFormData = z.infer<typeof perfilSchema>;
type PetFormData = z.infer<typeof petSchema>;

const ClientePerfil = () => {
  const { user, loading: authLoading } = useAuth();
  const { cliente, pets, loading: clienteLoading, updateClienteProfile, addPet, refreshData } = useCliente();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const perfilForm = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      name: "",
      phone: ""
    }
  });

  const petForm = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      age: ""
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/cliente/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (cliente) {
      perfilForm.reset({
        name: cliente.name,
        phone: cliente.phone
      });
    }
  }, [cliente, perfilForm]);

  const handleUpdatePerfil = async (data: PerfilFormData) => {
    try {
      setSaving(true);
      const success = await updateClienteProfile(data);
      
      if (success) {
        toast.success("Perfil atualizado com sucesso");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPet = async (data: PetFormData) => {
    try {
      setSaving(true);
      
      const petData = {
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        age: data.age !== undefined ? data.age : null
      };
      
      const success = await addPet(petData);
      
      if (success) {
        setIsDialogOpen(false);
        petForm.reset();
      }
    } catch (error) {
      console.error("Erro ao adicionar pet:", error);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || clienteLoading) {
    return <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Carregando...</p>
    </div>;
  }

  return (
    <ClienteLayout title="Meu Perfil">
      <Tabs defaultValue="dados">
        <TabsList className="mb-6">
          <TabsTrigger value="dados">Meus Dados</TabsTrigger>
          <TabsTrigger value="pets">Meus Pets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dados">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Atualize suas informações de contato</CardDescription>
            </CardHeader>
            <Form {...perfilForm}>
              <form onSubmit={perfilForm.handleSubmit(handleUpdatePerfil)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={perfilForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {cliente?.email && (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={cliente.email} disabled />
                    </div>
                  )}
                  
                  <FormField
                    control={perfilForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        <TabsContent value="pets">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Meus Pets</CardTitle>
                  <CardDescription>Gerencie os dados dos seus pets</CardDescription>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                  Adicionar Pet
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pets.map((pet) => (
                    <Card key={pet.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{pet.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Espécie:</span>
                            <span>{pet.species}</span>
                          </div>
                          
                          {pet.breed && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Raça:</span>
                              <span>{pet.breed}</span>
                            </div>
                          )}
                          
                          {pet.age && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Idade:</span>
                              <span>{pet.age} {pet.age === 1 ? "ano" : "anos"}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Você ainda não cadastrou nenhum pet.</p>
                  <Button variant="link" onClick={() => setIsDialogOpen(true)}>
                    Adicionar seu primeiro pet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Pet</DialogTitle>
              </DialogHeader>
              
              <Form {...petForm}>
                <form onSubmit={petForm.handleSubmit(handleAddPet)} className="space-y-4">
                  <FormField
                    control={petForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Pet</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Rex" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={petForm.control}
                    name="species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Espécie</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Cachorro, Gato" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={petForm.control}
                    name="breed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raça (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Golden Retriever" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={petForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idade em anos (opcional)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Salvando..." : "Adicionar Pet"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </ClienteLayout>
  );
};

export default ClientePerfil;
