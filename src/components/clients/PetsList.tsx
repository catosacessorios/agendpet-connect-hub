
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import type { Pet } from "@/hooks/use-clients";

type PetsListProps = {
  pets: Pet[];
  onDeletePet: (petId: string, petName: string) => void;
  onEdit?: (pet: Pet) => void;
};

export const PetsList: React.FC<PetsListProps> = ({ pets, onDeletePet, onEdit }) => {
  if (!pets || pets.length === 0) {
    return <p className="text-center py-4 text-gray-500">Nenhum pet cadastrado</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left py-2 px-4 font-medium text-gray-600">Nome</th>
            <th className="text-left py-2 px-4 font-medium text-gray-600">Espécie</th>
            <th className="text-left py-2 px-4 font-medium text-gray-600">Raça</th>
            <th className="text-right py-2 px-4 font-medium text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pets.map((pet) => (
            <tr key={pet.id} className="border-t hover:bg-gray-50">
              <td className="py-3 px-4">{pet.name}</td>
              <td className="py-3 px-4">
                {pet.species === "dog" ? "Cachorro" : 
                 pet.species === "cat" ? "Gato" : 
                 pet.species}
              </td>
              <td className="py-3 px-4">{pet.breed || "Não informado"}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(pet)}
                      className="hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDeletePet(pet.id, pet.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
