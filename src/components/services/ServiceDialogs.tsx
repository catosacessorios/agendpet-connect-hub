
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ServiceForm } from "./ServiceForm";
import { Button } from "@/components/ui/button";
import type { Service } from "@/hooks/use-services";

// Create/Edit Service Dialog
type ServiceFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => Promise<boolean>;
  currentService: Service | null;
};

export const ServiceFormDialog: React.FC<ServiceFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  currentService
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentService ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>
        <ServiceForm 
          onSave={onSave}
          onCancel={onClose}
          initialData={currentService}
        />
      </DialogContent>
    </Dialog>
  );
};

// Delete Confirmation Dialog
type DeleteDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  serviceName: string | null;
};

export const DeleteServiceDialog: React.FC<DeleteDialogProps> = ({
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
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={onConfirm}
            >
              Excluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
