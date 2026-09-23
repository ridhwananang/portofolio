import React, { useState, KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TagsInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    error?: string;
}

export function TagsInput({ value = [], onChange, placeholder = 'Ketik lalu tekan Enter...', error }: TagsInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    const addTag = () => {
        const trimmed = inputValue.trim().replace(/^,|,$/g, '');
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-input bg-transparent min-h-11 focus-within:ring-[3px] focus-within:ring-violet-500/30 focus-within:border-violet-500 transition-all">
                {value.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1.5 text-xs py-1 rounded-lg">
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:bg-muted/80 rounded-full p-0.5 transition-colors"
                            aria-label={`Hapus tag ${tag}`}
                        >
                            <X className="size-3" />
                        </button>
                    </Badge>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="flex-1 bg-transparent text-sm outline-none min-w-[120px] placeholder:text-muted-foreground"
                />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
