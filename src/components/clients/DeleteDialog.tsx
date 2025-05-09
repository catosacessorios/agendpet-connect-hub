
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DeleteDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemType: 'client' | 'pet';
  itemName: string | null;
};

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemType,
  itemName
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Tem certeza que deseja excluir {itemType === 'client' ? 'o cliente' : 'o pet'} "{itemName}"?</p>
          {itemType === 'client' && (
            <p className="text-red-500 text-sm mt-2">Essa ação também excluirá todos os pets associados a este cliente.</p>
          )}
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
