import {
    Moon,
    Sun,
    Award,
    Briefcase,
    Code,
    Home,
    Sparkles,
    ExternalLink,
    Send,
    ChevronRight,
    Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

interface HeaderProps {
    onOpenContact: () => void;
    onOpenTracking: () => void;
    activeSection: string;
    setActiveSection: (section: string) => void;
}

export default function Header({
    onOpenContact,
    onOpenTracking,
    activeSection,
    setActiveSection,
}: HeaderProps) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDarkMode = resolvedAppearance === 'dark';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            // Calculate scroll progress percentage
            const totalScroll =
                document.documentElement.scrollHeight - window.innerHeight;

            if (totalScroll > 0) {
                setScrollProgress((window.scrollY / totalScroll) * 100);
            } else {
                setScrollProgress(0);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        const nextMode = isDarkMode ? 'light' : 'dark';
        updateAppearance(nextMode);
    };

    const navItems = [
        { label: 'Beranda', id: 'hero', icon: Home },
        { label: 'Tech Stack', id: 'tech-stack', icon: Code },
        { label: 'Karya', id: 'karya', icon: Briefcase },
        { label: 'Layanan', id: 'layanan', icon: Sparkles },
        { label: 'Sertifikat', id: 'sertifikat', icon: Award },
    ];

    const handleNavClick = (id: string) => {
        setActiveSection(id);
        setIsMobileMenuOpen(false);
        const element = document.getElementById(id);

        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };

    return (
        <header
            id="main-header"
            className={`fixed top-0 left-0 z-45 w-full transition-all duration-300 ${
                isScrolled
                    ? 'border-b border-slate-200/60 bg-white/80 py-2.5 shadow-xs backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/20'
                    : 'bg-transparent py-4 sm:py-5'
            }`}
        >
            {/* Top Scroll Progress Indicator */}
            <div
                className="absolute top-0 left-0 h-[2.5px] bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-all duration-150 ease-out z-50 pointer-events-none"
                style={{ width: `${scrollProgress}%` }}
            />

            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand Logo & Name */}
                <div
                    onClick={() => handleNavClick('hero')}
                    className="group flex cursor-pointer items-center gap-2.5 select-none"
                >
                    <div className="relative">
                        <img
                            src="/images/anang-logo.png"
                            alt="Ridhwan Anang Logo"
                            className="size-9 sm:size-10 object-contain rounded-xl border border-slate-200/80 dark:border-white/15 shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:shadow-violet-500/20"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 animate-pulse" />
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                Ridhwan Anang
                            </span>
                            <span className="hidden sm:inline-flex items-center px-1.5 py-0.25 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                                Engineer
                            </span>
                        </div>
                        <span className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            Portfolio & Solutions
                        </span>
                    </div>
                </div>

                {/* Desktop Floating Pill Navigation */}
                <nav className="hidden items-center gap-1 rounded-2xl border border-slate-200/60 bg-white/70 p-1.5 shadow-xs backdrop-blur-md md:flex dark:border-white/10 dark:bg-slate-900/60">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`relative z-10 flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                                    isActive
                                        ? 'text-violet-600 dark:text-white font-bold'
                                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavBackground"
                                        className="absolute inset-0 -z-10 rounded-xl bg-white shadow-xs border border-slate-200/60 dark:bg-slate-800 dark:border-white/10"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 32,
                                        }}
                                    />
                                )}
                                <Icon size={14} className={isActive ? 'text-violet-600 dark:text-violet-400' : ''} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}

                    <a
                        href="https://www.dicoding.com/users/riedmarf12/academies"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <Award size={14} />
                        <span>Dicoding</span>
                        <ExternalLink size={11} className="opacity-70" />
                    </a>
                </nav>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* Dark/Light Mode Switcher */}
                    <button
                        onClick={toggleTheme}
                        className="cursor-pointer rounded-xl border border-slate-200/60 bg-white/80 p-2.5 text-slate-700 shadow-xs transition-all duration-200 hover:border-slate-300 hover:text-violet-600 active:scale-95 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-violet-400"
                        aria-label="Toggle tema gelap/terang"
                    >
                        {isDarkMode ? (
                            <Sun size={17} className="text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
                        ) : (
                            <Moon size={17} className="text-violet-600 transition-transform duration-300 rotate-0 hover:-rotate-12" />
                        )}
                    </button>

                    {/* Quick Project Tracker Button (Desktop) */}
                    <button
                        onClick={onOpenTracking}
                        className="hidden cursor-pointer items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 px-3.5 py-2.5 text-xs font-bold text-violet-700 dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-900/50 shadow-xs transition-all duration-200 active:scale-95 sm:inline-flex"
                        title="Lacak Status Pesanan Proyek"
                    >
                        <Search size={13} className="text-violet-600 dark:text-violet-400" />
                        <span>Lacak Proyek</span>
                    </button>

                    {/* Quick Contact Button */}
                    <button
                        onClick={onOpenContact}
                        className="hidden cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-bold tracking-wide text-white shadow-md shadow-violet-500/20 transition-all duration-200 active:scale-95 sm:inline-flex"
                    >
                        <Send size={13} />
                        <span>Hubungi</span>
                    </button>

                    {/* Stylized 3-Bar to X Morphing Hamburger Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/80 shadow-xs transition-all duration-200 hover:border-slate-300 active:scale-95 md:hidden dark:border-white/10 dark:bg-slate-900/80 dark:hover:border-white/20 cursor-pointer"
                        aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                    >
                        <div className="relative flex size-4 flex-col items-center justify-center gap-1">
                            <span
                                className={`h-0.5 w-4 rounded-full bg-slate-700 transition-all duration-300 dark:bg-slate-200 ${
                                    isMobileMenuOpen ? 'translate-y-[6px] rotate-45' : ''
                                }`}
                            />
                            <span
                                className={`h-0.5 w-4 rounded-full bg-slate-700 transition-all duration-300 dark:bg-slate-200 ${
                                    isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''
                                }`}
                            />
                            <span
                                className={`h-0.5 w-4 rounded-full bg-slate-700 transition-all duration-300 dark:bg-slate-200 ${
                                    isMobileMenuOpen ? '-translate-y-[6px] -rotate-45' : ''
                                }`}
                            />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Navigation (Modern Glassmorphic Dropdown Sheet) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute top-full left-0 w-full border-b border-slate-200/80 bg-white/95 px-4 py-5 shadow-2xl backdrop-blur-2xl md:hidden dark:border-white/10 dark:bg-slate-950/95"
                    >
                        <div className="space-y-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeSection === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavClick(item.id)}
                                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                                            isActive
                                                ? 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300 font-bold border border-violet-500/20'
                                                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`size-8 rounded-lg flex items-center justify-center ${
                                                    isActive
                                                        ? 'bg-violet-500/20 text-violet-600 dark:text-violet-300'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                }`}
                                            >
                                                <Icon size={16} />
                                            </div>
                                            <span>{item.label}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-400 dark:text-slate-600" />
                                    </button>
                                );
                            })}

                            {/* Mobile Project Tracker Item */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    onOpenTracking();
                                }}
                                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 border border-transparent cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                        <Search size={16} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-slate-800 dark:text-slate-200">Lacak Status Proyek</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Pantau progres & staging preview</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-slate-400 dark:text-slate-600" />
                            </button>

                            <a
                                href="https://www.dicoding.com/users/riedmarf12/academies"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 border border-transparent"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                        <Award size={16} />
                                    </div>
                                    <span>Dicoding Profile</span>
                                </div>
                                <ExternalLink size={15} className="text-slate-400 dark:text-slate-600" />
                            </a>
                        </div>

                        {/* Mobile Contact Action Button */}
                        <div className="pt-4 mt-3 border-t border-slate-200/80 dark:border-white/10">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    onOpenContact();
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md shadow-violet-500/20 transition-all duration-200 active:scale-98"
                            >
                                <Send size={14} />
                                <span>Hubungi Saya</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
