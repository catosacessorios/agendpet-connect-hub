
import { useState } from "react";
import ClienteLayout from "@/components/layout/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCliente } from "@/hooks/use-cliente";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Perfil schema
const perfilSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().min(10, "Telefone inválido").max(15, "Telefone inválido")
});
type PerfilFormData = z.infer<typeof perfilSchema>;

// Pet schema
const petSchema = z.object({
  name: z.string().min(2, "Nome do pet deve ter pelo menos 2 caracteres"),
  species: z.string().min(1, "Espécie é obrigatória"),
  breed: z.string().optional(),
  age: z.union([
    z.number().positive("Idade deve ser maior que zero").optional(),
    z.string().transform(val => val === "" ? undefined : Number(val))
  ]).optional(),
  weight: z.union([
    z.number().optional(),
    z.string().transform(val => val === "" ? undefined : Number(val))
  ]).optional(),
  notes: z.string().optional()
});
type PetFormData = z.infer<typeof petSchema>;

const ClientePerfil = () => {
  const { cliente, loading, updateClienteProfile, addPet, pets } = useCliente();
  const [activeTab, setActiveTab] = useState("perfil");
  const [saving, setSaving] = useState(false);

  // Form para dados do perfil
  const perfilForm = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      name: cliente?.name || "",
      email: cliente?.email || "",
      phone: cliente?.phone || ""
    },
    values: {
      name: cliente?.name || "",
      email: cliente?.email || "",
      phone: cliente?.phone || ""
    }
  });

  // Form para adicionar pet
  const petForm = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      age: undefined,
      weight: undefined,
      notes: ""
    }
  });

  const handlePerfilSubmit = async (data: PerfilFormData) => {
    if (!cliente) return;
    
    try {
      setSaving(true);
      await updateClienteProfile(data);
    } finally {
      setSaving(false);
    }
  };

  const handlePetSubmit = async (data: PetFormData) => {
    try {
      setSaving(true);
      
      // Ensure that age and weight are properly converted to numbers or null
      const petData = {
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        age: data.age !== undefined ? Number(data.age) : null,
        weight: data.weight !== undefined ? Number(data.weight) : null,
        notes: data.notes || null
      };
      
      const success = await addPet(petData);
      
      if (success) {
        petForm.reset();
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ClienteLayout title="Meu Perfil">
      <div className="text-center py-8">
        <p className="text-gray-500">Carregando dados do perfil...</p>
      </div>
    </ClienteLayout>;
  }

  return (
    <ClienteLayout title="Meu Perfil">
      <Tabs defaultValue="perfil" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="pets">Meus Pets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...perfilForm}>
                <form onSubmit={perfilForm.handleSubmit(handlePerfilSubmit)} className="space-y-4">
                  <FormField
                    control={perfilForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Seu nome" disabled={saving} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={perfilForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="seu@email.com" disabled={saving} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={perfilForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(00) 00000-0000" disabled={saving} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={saving}>
                    {saving ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pets">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Adicionar novo pet</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...petForm}>
                <form onSubmit={petForm.handleSubmit(handlePetSubmit)} className="space-y-4">
                  <FormField
                    control={petForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do pet</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do pet" disabled={saving} />
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
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value} 
                          disabled={saving}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a espécie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cachorro">Cachorro</SelectItem>
                            <SelectItem value="Gato">Gato</SelectItem>
                            <SelectItem value="Ave">Ave</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <Input {...field} placeholder="Raça do pet" disabled={saving} />
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
                          <Input 
                            type="number"
                            min="0"
                            step="1"
                            {...field}
                            value={field.value === undefined ? '' : field.value}
                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            placeholder="Idade do pet" 
                            disabled={saving} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={petForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso em kg (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.1"
                            {...field}
                            value={field.value === undefined ? '' : field.value}
                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            placeholder="Peso do pet" 
                            disabled={saving} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={petForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="Observações sobre o pet" 
                            disabled={saving} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={saving}>
                    {saving ? "Salvando..." : "Adicionar pet"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Meus pets</CardTitle>
            </CardHeader>
            <CardContent>
              {pets.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Você não possui pets cadastrados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pets.map(pet => (
                    <div key={pet.id} className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg">{pet.name}</h3>
                      <p className="text-sm text-gray-600">
                        {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
                        {pet.age ? ` • ${pet.age} ${pet.age === 1 ? 'ano' : 'anos'}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ClienteLayout>
  );
};

export default ClientePerfil;
