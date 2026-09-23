import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5 w-full select-none">
            <img
                src="/images/anang-logo.png"
                alt="Ridhwan Anang Logo"
                className="size-8 rounded-lg object-contain border border-slate-200/80 dark:border-white/10 shadow-xs"
            />
            <div className="flex flex-col text-left overflow-hidden">
                <span className="truncate text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    Ridhwan Studio
                </span>
                <span className="truncate text-[10.5px] font-medium text-violet-600 dark:text-violet-400">
                    Creator Cockpit
                </span>
            </div>
        </div>
    );
}
