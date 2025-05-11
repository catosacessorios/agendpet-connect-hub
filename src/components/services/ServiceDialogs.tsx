
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ServiceForm } from "./ServiceForm";
import type { Service } from "@/hooks/use-services";
import type { ServiceFormData } from "./ServiceForm";

interface ServiceFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ServiceFormData) => Promise<boolean>;
  currentService: Service | null;
  priceOnly?: boolean;
}

export const ServiceFormDialog: React.FC<ServiceFormDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentService,
  priceOnly = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentService
              ? priceOnly
                ? `Editar Preço: ${currentService.name}`
                : `Editar Serviço: ${currentService.name}`
              : "Adicionar Novo Serviço"
            }
          </DialogTitle>
        </DialogHeader>
        <ServiceForm 
          onSave={onSave}
          onCancel={onClose}
          initialData={currentService}
          priceOnly={priceOnly}
        />
      </DialogContent>
    </Dialog>
  );
};

interface DeleteServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serviceName: string | null;
}

export const DeleteServiceDialog: React.FC<DeleteServiceDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  serviceName
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Tem certeza que deseja excluir o serviço "{serviceName}"?</p>
          <p className="text-gray-500 text-sm mt-2">Esta ação não pode ser desfeita.</p>
          
          <div className="pt-6 flex justify-end space-x-2">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              onClick={onConfirm}
            >
              Excluir
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
