import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, X } from 'lucide-react';

interface ImageUploadProps {
    currentImageUrl?: string | null;
    onChange: (file: File | null) => void;
    accept?: string;
    label?: string;
    error?: string;
}

export function ImageUpload({
    currentImageUrl,
    onChange,
    accept = 'image/*',
    label = 'Upload Gambar',
    error,
}: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            onChange(file);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const displayUrl = previewUrl || currentImageUrl;

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
            />

            {displayUrl ? (
                <div className="relative group overflow-hidden rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800/80 max-w-md shadow-lg shadow-slate-100/40 dark:shadow-none bg-white dark:bg-slate-900">
                    <img
                        src={displayUrl}
                        alt="Preview"
                        className="w-full h-52 object-cover rounded-[1.8rem] transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2.5">
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="rounded-xl font-bold text-xs bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white shadow-md hover:bg-white cursor-pointer"
                            onClick={() => inputRef.current?.click()}
                        >
                            Ganti Berkas
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="rounded-xl size-9 p-0 shadow-md cursor-pointer"
                            onClick={handleRemove}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[1.8rem] p-7 hover:border-violet-500/60 hover:bg-violet-50/30 dark:hover:bg-violet-950/10 transition-all duration-300 cursor-pointer text-center bg-slate-50/50 dark:bg-slate-900/30 group"
                >
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500/10 via-indigo-500/10 to-blue-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 mb-3 shadow-xs group-hover:scale-110 transition-transform duration-300">
                        <UploadCloud className="size-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">PNG, JPG, WEBP, atau PDF hingga 15MB</p>
                </div>
            )}
            {error && <p className="text-xs font-semibold text-rose-500 mt-1">{error}</p>}
        </div>
    );
}
