import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    confirmLabel?: string;
    cancelText?: string;
    variant?: 'destructive' | 'default';
    onConfirm: () => void;
    loading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Hapus',
    confirmLabel,
    cancelText = 'Batal',
    variant = 'destructive',
    onConfirm,
    loading = false,
}: ConfirmDialogProps) {
    const finalConfirmText = confirmLabel || confirmText;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl border-sidebar-border bg-card/95 backdrop-blur-xl shadow-2xl max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-2 mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="rounded-xl"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant}
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-xl"
                    >
                        {loading ? 'Memproses...' : finalConfirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
