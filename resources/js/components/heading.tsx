export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <header
            className={
                variant === 'small'
                    ? 'space-y-1 pb-4 border-b border-slate-200/70 dark:border-slate-800/80 mb-6'
                    : 'mb-8 space-y-1'
            }
        >
            <h2
                className={
                    variant === 'small'
                        ? 'text-base sm:text-lg font-bold text-slate-900 dark:text-white'
                        : 'text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white'
                }
            >
                {title}
            </h2>
            {description && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {description}
                </p>
            )}
        </header>
    );
}
