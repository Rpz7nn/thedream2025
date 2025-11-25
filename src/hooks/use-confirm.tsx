import { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmOptions {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
}

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
  }, []);

  const handleConfirm = async () => {
    if (options?.onConfirm) {
      await options.onConfirm();
    }
    setOpen(false);
    setOptions(null);
  };

  const handleCancel = async () => {
    if (options?.onCancel) {
      await options.onCancel();
    }
    setOpen(false);
    setOptions(null);
  };

  const ConfirmDialog = () => {
    if (!options) return null;

    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-[#ffffff]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-[#ffffff]">
              {options.title || 'Confirmar ação'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#999999] whitespace-pre-line">
              {options.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancel}
              className="bg-[#0f0f0f] border-[#1a1a1a] text-[#999999] hover:bg-[#1a1a1a] hover:text-[#ffffff]"
            >
              {options.cancelText || 'Cancelar'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-[#ffffff] text-[#000000] hover:bg-[#f5f5f5]"
            >
              {options.confirmText || 'OK'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return { confirm, ConfirmDialog };
}

