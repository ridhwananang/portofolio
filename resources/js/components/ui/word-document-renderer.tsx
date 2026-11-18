import { Check } from 'lucide-react';
import React from 'react';

export function formatInlineMarkdown(text: string): React.ReactNode {
    if (!text) {
        return null;
    }

    const parts = text.split(
        /(<mark>.*?<\/mark>|<u>.*?<\/u>|`.*?`|\*\*.*?\*\*|\*.*?\*|~~.*?~~)/g,
    );

    return parts.map((part, index) => {
        if (part.startsWith('<mark>') && part.endsWith('</mark>')) {
            return (
                <mark
                    key={index}
                    className="rounded bg-amber-200 px-1 py-0.5 font-medium text-amber-950 dark:bg-amber-900/60 dark:text-amber-100"
                >
                    {part.replace(/<\/?mark>/g, '')}
                </mark>
            );
        }

        if (part.startsWith('<u>') && part.endsWith('</u>')) {
            return (
                <span
                    key={index}
                    className="underline decoration-violet-500 underline-offset-4"
                >
                    {part.replace(/<\/?u>/g, '')}
                </span>
            );
        }

        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code
                    key={index}
                    className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-violet-600 dark:border-slate-700/60 dark:bg-slate-800 dark:text-violet-400"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }

        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong
                    key={index}
                    className="font-extrabold text-slate-900 dark:text-white"
                >
                    {part.slice(2, -2)}
                </strong>
            );
        }

        if (part.startsWith('*') && part.endsWith('*')) {
            return (
                <em
                    key={index}
                    className="text-slate-800 italic dark:text-slate-300"
                >
                    {part.slice(1, -1)}
                </em>
            );
        }

        if (part.startsWith('~~') && part.endsWith('~~')) {
            return (
                <del key={index} className="text-slate-400 line-through">
                    {part.slice(2, -2)}
                </del>
            );
        }

        return part;
    });
}

function getAlignClass(align: 'left' | 'center' | 'right' | null): string {
    if (align === 'center') {
        return 'text-center';
    }

    if (align === 'right') {
        return 'text-right';
    }

    if (align === 'left') {
        return 'text-left';
    }

    return '';
}

export function renderWordDocumentNodes(
    content: string,
    onToggleChecklist?: (lineIndex: number) => void,
): React.ReactNode[] {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    let inCodeBlock = false;
    let codeContent: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let activeAlign: 'left' | 'center' | 'right' | null = null;
    let checklistCounter = 0;

    const flushTable = (key: string) => {
        if (tableRows.length === 0) {
            return;
        }

        const headerRow = tableRows[0];
        const alignRow =
            tableRows.length > 1 &&
            tableRows[1].every((cell) => /^:?-+:?$/.test(cell.trim()))
                ? tableRows[1]
                : null;

        const colAligns = headerRow.map((_, cIdx) => {
            const raw = alignRow?.[cIdx]?.trim() ?? '';

            if (raw.startsWith(':') && raw.endsWith(':')) {
                return 'text-center';
            }

            if (raw.endsWith(':')) {
                return 'text-right';
            }

            return 'text-left';
        });

        const dataRows = tableRows
            .slice(1)
            .filter((r) => !r.every((cell) => /^:?-+:?$/.test(cell.trim())));

        elements.push(
            <div
                key={`table-${key}`}
                className="my-4 overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <table className="w-full border-collapse text-left text-xs">
                    <thead>
                        <tr className="border-b border-violet-100 bg-violet-50/90 font-bold tracking-wider text-violet-950 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200">
                            {headerRow.map((cell, cIdx) => (
                                <th
                                    key={cIdx}
                                    className={`border-r border-slate-200/80 p-3 font-bold whitespace-nowrap last:border-r-0 dark:border-slate-800 ${colAligns[cIdx] ?? 'text-left'}`}
                                >
                                    {formatInlineMarkdown(cell.trim())}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800/80 dark:bg-slate-900">
                        {dataRows.map((row, rIdx) => {
                            const isEven = rIdx % 2 === 0;

                            return (
                                <tr
                                    key={rIdx}
                                    className={`transition-colors ${
                                        isEven
                                            ? 'bg-white hover:bg-violet-50/30 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                                            : 'bg-slate-50/80 hover:bg-violet-50/50 dark:bg-slate-800/35 dark:hover:bg-slate-800/70'
                                    }`}
                                >
                                    {headerRow.map((_, cIdx) => {
                                        const trimmed = (row[cIdx] ?? '').trim();
                                        const isStatusBadge =
                                            /^(Siap Diserahkan|Selesai|Done|Completed|Passed|Direncanakan|Planned|Sedang Berjalan|In Progress|In-Progress|Dijadwalkan|Scheduled)$/i.test(
                                                trimmed,
                                            );

                                        return (
                                            <td
                                                key={cIdx}
                                                className={`border-r border-slate-200/70 p-3 font-medium text-slate-800 last:border-r-0 dark:border-slate-800 dark:text-slate-200 ${colAligns[cIdx] ?? 'text-left'}`}
                                            >
                                                {isStatusBadge ? (
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                                            /^(Siap Diserahkan|Selesai|Done|Completed|Passed)$/i.test(
                                                                trimmed,
                                                            )
                                                                ? 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                                : /^(Sedang Berjalan|In Progress|In-Progress)$/i.test(
                                                                        trimmed,
                                                                    )
                                                                  ? 'border border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                                                                  : 'border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                                        }`}
                                                    >
                                                        {trimmed}
                                                    </span>
                                                ) : (
                                                    formatInlineMarkdown(trimmed)
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>,
        );
        tableRows = [];
        inTable = false;
    };

    const flushCodeBlock = (key: string) => {
        if (codeContent.length === 0) {
            inCodeBlock = false;

            return;
        }

        elements.push(
            <div
                key={`code-${key}`}
                className="my-3.5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 shadow-inner"
            >
                <pre>{codeContent.join('\n')}</pre>
            </div>,
        );
        codeContent = [];
        inCodeBlock = false;
    };

    lines.forEach((line, idx) => {
        const trimmedLine = line.trim();

        // Fenced code blocks
        if (trimmedLine.startsWith('```')) {
            if (inCodeBlock) {
                flushCodeBlock(`cb-${idx}`);
            } else {
                if (inTable) {
                    flushTable(`tbl-${idx}`);
                }

                inCodeBlock = true;
            }

            return;
        }

        if (inCodeBlock) {
            codeContent.push(line);

            return;
        }

        // Single-line <div align="...">text</div>
        const inlineAlignMatch = trimmedLine.match(
            /^<div\s+align="(left|center|right)">(.*?)<\/div>$/i,
        );

        if (inlineAlignMatch) {
            if (inTable) {
                flushTable(`tbl-${idx}`);
            }

            const dir = inlineAlignMatch[1].toLowerCase() as
                | 'left'
                | 'center'
                | 'right';
            elements.push(
                <p
                    key={idx}
                    className={`my-1.5 text-xs leading-relaxed text-slate-800 sm:text-sm dark:text-slate-200 ${getAlignClass(dir)}`}
                >
                    {formatInlineMarkdown(inlineAlignMatch[2])}
                </p>,
            );

            return;
        }

        // Multi-line <div align="..."> wrapper tags
        const openAlignMatch = trimmedLine.match(
            /^<div\s+align="(left|center|right)">$/i,
        );

        if (openAlignMatch) {
            if (inTable) {
                flushTable(`tbl-${idx}`);
            }

            activeAlign = openAlignMatch[1].toLowerCase() as
                | 'left'
                | 'center'
                | 'right';

            return;
        }

        if (trimmedLine.toLowerCase() === '</div>' && activeAlign) {
            activeAlign = null;

            return;
        }

        // Table rows (| a | b |)
        if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
            const cells = trimmedLine
                .slice(1, -1)
                .split('|')
                .map((c) => c.trim());

            if (!inTable) {
                inTable = true;
            }

            tableRows.push(cells);

            return;
        } else if (inTable) {
            flushTable(`tbl-${idx}`);
        }

        const alignCls = getAlignClass(activeAlign);

        // Headings
        if (line.startsWith('# ')) {
            elements.push(
                <h1
                    key={idx}
                    className={`mt-5 mb-2.5 flex items-center gap-2 border-b border-violet-500/25 pb-2 text-xl font-black text-slate-900 sm:text-2xl dark:text-white ${alignCls}`}
                >
                    {formatInlineMarkdown(line.slice(2))}
                </h1>,
            );

            return;
        }

        if (line.startsWith('## ')) {
            elements.push(
                <h2
                    key={idx}
                    className={`mt-4 mb-2 flex items-center gap-2 text-base font-extrabold text-violet-700 sm:text-lg dark:text-violet-300 ${alignCls}`}
                >
                    {formatInlineMarkdown(line.slice(3))}
                </h2>,
            );

            return;
        }

        if (line.startsWith('### ')) {
            elements.push(
                <h3
                    key={idx}
                    className={`mt-3 mb-1.5 text-xs font-bold text-slate-800 sm:text-sm dark:text-slate-200 ${alignCls}`}
                >
                    {formatInlineMarkdown(line.slice(4))}
                </h3>,
            );

            return;
        }

        if (line.startsWith('#### ')) {
            elements.push(
                <h4
                    key={idx}
                    className={`mt-2.5 mb-1 text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300 ${alignCls}`}
                >
                    {formatInlineMarkdown(line.slice(5))}
                </h4>,
            );

            return;
        }

        // Blockquote / Callout Statement
        if (line.startsWith('> ')) {
            elements.push(
                <blockquote
                    key={idx}
                    className={`my-2.5 rounded-r-xl border-l-4 border-violet-500 bg-violet-50/75 p-3.5 text-xs text-slate-800 italic shadow-sm sm:text-sm dark:bg-violet-950/30 dark:text-slate-200 ${alignCls}`}
                >
                    {formatInlineMarkdown(line.slice(2))}
                </blockquote>,
            );

            return;
        }

        // Horizontal Rule
        if (trimmedLine === '---' || trimmedLine === '***') {
            elements.push(
                <hr
                    key={idx}
                    className="my-4 border-t border-slate-200 dark:border-slate-800"
                />,
            );

            return;
        }

        // Checklist (- [ ] or - [x]) — Crisp, readable without strikethrough
        const checkMatch = line.match(/^(\s*[-*]\s*)\[([ xX])\]\s*(.*)/);

        if (checkMatch) {
            const isChecked = checkMatch[2].toLowerCase() === 'x';
            const itemText = checkMatch[3];
            const currentIdx = checklistCounter;
            checklistCounter++;

            elements.push(
                <div
                    key={idx}
                    onClick={
                        onToggleChecklist
                            ? () => onToggleChecklist(currentIdx)
                            : undefined
                    }
                    className={`my-1.5 flex items-start gap-2.5 rounded-xl border p-2.5 text-xs transition-all sm:text-sm ${
                        onToggleChecklist ? 'cursor-pointer select-none' : ''
                    } ${
                        isChecked
                            ? 'border-emerald-500/25 bg-emerald-500/[0.06] text-slate-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-slate-100'
                            : 'border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                    } ${onToggleChecklist && !isChecked ? 'hover:border-violet-500/50' : ''}`}
                    title={
                        onToggleChecklist
                            ? 'Klik untuk mengubah status centang'
                            : undefined
                    }
                >
                    <div
                        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-md border ${
                            isChecked
                                ? 'border-emerald-500 bg-emerald-500 text-white shadow-2xs'
                                : 'border-slate-400 bg-transparent dark:border-slate-600'
                        }`}
                    >
                        {isChecked ? <Check className="size-3 stroke-[3]" /> : null}
                    </div>
                    <span className="flex-1">
                        {formatInlineMarkdown(itemText)}
                    </span>
                </div>,
            );

            return;
        }

        // Bullet List
        if (line.match(/^(\s*)[-*•]\s+(.*)/)) {
            const match = line.match(/^(\s*)[-*•]\s+(.*)/);
            elements.push(
                <div
                    key={idx}
                    className={`my-1 ml-2 flex items-start gap-2.5 text-xs text-slate-800 sm:text-sm dark:text-slate-200 ${alignCls}`}
                >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-violet-500" />
                    <span className="flex-1">
                        {formatInlineMarkdown(match ? match[2] : line)}
                    </span>
                </div>,
            );

            return;
        }

        // Numbered List
        if (line.match(/^(\s*)(\d+)\.\s+(.*)/)) {
            const match = line.match(/^(\s*)(\d+)\.\s+(.*)/);
            elements.push(
                <div
                    key={idx}
                    className={`my-1 ml-2 flex items-start gap-2.5 text-xs text-slate-800 sm:text-sm dark:text-slate-200 ${alignCls}`}
                >
                    <span className="mt-0.5 inline-flex size-4.5 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/15 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                        {match ? match[2] : '•'}
                    </span>
                    <span className="flex-1">
                        {formatInlineMarkdown(match ? match[3] : line)}
                    </span>
                </div>,
            );

            return;
        }

        // Empty line or paragraph
        if (!trimmedLine) {
            elements.push(<div key={idx} className="h-2.5" />);
        } else {
            elements.push(
                <p
                    key={idx}
                    className={`my-1.5 text-xs leading-relaxed text-slate-800 sm:text-sm dark:text-slate-200 ${alignCls}`}
                >
                    {formatInlineMarkdown(line)}
                </p>,
            );
        }
    });

    if (inTable) {
        flushTable('end-table');
    }

    if (inCodeBlock) {
        flushCodeBlock('end-code');
    }

    return elements;
}
