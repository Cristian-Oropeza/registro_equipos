import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

interface ModalDetalleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const ModalDetalle: React.FC<ModalDetalleProps> = ({
  open,
  onOpenChange,
  titulo,
  descripcion,
  children,
  footer,
  maxWidth = 'lg',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{titulo}</DialogTitle>
          {descripcion && (
            <DialogDescription>{descripcion}</DialogDescription>
          )}
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-4">
          {children}
        </div>

        {footer && (
          <>
            <Separator className="my-4" />
            <DialogFooter>{footer}</DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalDetalle;