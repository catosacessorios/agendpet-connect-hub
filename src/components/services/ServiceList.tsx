
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Service } from "@/hooks/use-services";

type ServiceListProps = {
  services: Service[];
  isLoading: boolean;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
};

export const ServiceList: React.FC<ServiceListProps> = ({ 
  services, 
  isLoading, 
  onEdit, 
  onDelete 
}) => {
  // Format currency to BRL
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Carregando serviços...</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <p>Nenhum serviço encontrado. Adicione um novo serviço para começar.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-gray-600">Serviço</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Descrição</th>
            <th className="text-center py-3 px-4 font-medium text-gray-600">Duração</th>
            <th className="text-right py-3 px-4 font-medium text-gray-600">Preço</th>
            <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
            <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">{service.name}</td>
              <td className="py-3 px-4">
                {service.description || "Sem descrição"}
              </td>
              <td className="py-3 px-4 text-center">{service.duration} min</td>
              <td className="py-3 px-4 text-right">
                {formatCurrency(service.price)}
              </td>
              <td className="py-3 px-4 text-center">
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  service.active 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {service.active ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(service)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(service)}
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
