
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, PlusIcon } from "lucide-react";
import type { Client, Pet } from "@/hooks/use-clients";
import { PetsList } from "./PetsList";

type ClientCardProps = {
  client: Client;
  pets: Pet[];
  onEdit: () => void;
  onDelete: () => void;
  onAddPet: () => void;
  onDeletePet: (petId: string, petName: string) => void;
};

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  pets,
  onEdit,
  onDelete,
  onAddPet,
  onDeletePet
}) => {
  return (
    <Card key={client.id} className="overflow-hidden">
      <CardHeader className="bg-gray-50 py-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{client.name}</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Telefone</p>
            <p>{client.phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p>{client.email || "Não informado"}</p>
          </div>
        </div>

        <Tabs defaultValue="pets">
          <TabsList className="mb-4">
            <TabsTrigger value="pets">Pets</TabsTrigger>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          </TabsList>
          <TabsContent value="pets">
            <PetsList 
              pets={pets} 
              onDeletePet={onDeletePet} 
            />
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onAddPet}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Adicionar Pet
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="appointments">
            <p className="text-center py-4 text-gray-500">Histórico de agendamentos em breve</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
