import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Education } from '@/types';

interface EducationRepeaterProps {
    value: Education[];
    onChange: (items: Education[]) => void;
}

export function EducationRepeater({ value = [], onChange }: EducationRepeaterProps) {
    const handleAdd = () => {
        onChange([...value, { school: '', major: '', period: '' }]);
    };

    const handleRemove = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: keyof Education, val: string) => {
        const updated = [...value];
        updated[index] = { ...updated[index], [field]: val };
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-slate-900 dark:text-white">Riwayat Pendidikan</Label>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAdd}
                    className="gap-1.5 rounded-xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
                >
                    <Plus className="size-3.5" />
                    Tambah Pendidikan
                </Button>
            </div>

            {value.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-[1.6rem] text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 font-medium">
                    Belum ada riwayat pendidikan. Klik "Tambah Pendidikan" untuk menambahkan data sekolah atau universitas.
                </div>
            ) : (
                <div className="space-y-3">
                    {value.map((item, index) => (
                        <div
                            key={index}
                            className="p-5 rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm space-y-3 relative group shadow-xs transition-all duration-300 hover:border-amber-400/50 hover:shadow-md"
                        >
                            <div className="flex justify-between items-center">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                                    Pendidikan #{index + 1}
                                </span>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
                                    onClick={() => handleRemove(index)}
                                    aria-label={`Hapus pendidikan #${index + 1}`}
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Nama Sekolah / Kampus</Label>
                                    <Input
                                        value={item.school}
                                        onChange={(e) => handleChange(index, 'school', e.target.value)}
                                        placeholder="cth: Universitas Gadjah Mada"
                                        required
                                        className="rounded-xl text-xs border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus-visible:ring-amber-500/30"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Jurusan / Konsentrasi</Label>
                                    <Input
                                        value={item.major || ''}
                                        onChange={(e) => handleChange(index, 'major', e.target.value)}
                                        placeholder="cth: Teknik Informatika"
                                        className="rounded-xl text-xs border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus-visible:ring-amber-500/30"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Tahun / Periode</Label>
                                    <Input
                                        value={item.period || ''}
                                        onChange={(e) => handleChange(index, 'period', e.target.value)}
                                        placeholder="cth: 2020 - 2024"
                                        className="rounded-xl text-xs border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus-visible:ring-amber-500/30"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
