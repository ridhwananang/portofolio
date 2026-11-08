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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

interface HeaderProps {
    onOpenContact: () => void;
    onOpenTracking: () => void;
    activeSection: string;
    setActiveSection: (section: string) => void;
}

export default function Header({
    onOpenContact,
    activeSection,
    setActiveSection,
}: HeaderProps) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDarkMode = resolvedAppearance === 'dark';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const isScrolledRef = useRef(false);

    useEffect(() => {
        let rafId: number | null = null;

        const handleScroll = () => {
            if (rafId !== null) return;

            rafId = requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const scrolled = scrollY > 20;

                if (scrolled !== isScrolledRef.current) {
                    isScrolledRef.current = scrolled;
                    setIsScrolled(scrolled);
                }

                if (progressBarRef.current) {
                    const totalScroll =
                        document.documentElement.scrollHeight - window.innerHeight;
                    const progress =
                        totalScroll > 0 ? Math.min(scrollY / totalScroll, 1) : 0;
                    progressBarRef.current.style.transform = `scaleX(${progress})`;
                }

                rafId = null;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    const toggleTheme = () => {
        const nextMode = isDarkMode ? 'light' : 'dark';
        updateAppearance(nextMode);
    };

    const navItems = [
        { label: 'Tentang', id: 'hero', icon: Home },
        { label: 'Stack', id: 'tech-stack', icon: Code },
        { label: 'Portofolio', id: 'karya', icon: Briefcase },
        { label: 'Sertifikasi', id: 'sertifikat', icon: Award },
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
            className={`fixed top-0 left-0 z-45 w-full transition-all duration-200 ${
                isScrolled
                    ? 'border-b border-zinc-200/90 bg-white/90 py-2.5 shadow-2xs backdrop-blur-md dark:border-white/8 dark:bg-[#0c0e14]/90'
                    : 'bg-transparent py-4'
            }`}
        >
            {/* Top Scroll Progress Indicator */}
            <div
                ref={progressBarRef}
                className="absolute top-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 z-50 pointer-events-none will-change-transform"
                style={{ transform: 'scaleX(0)' }}
            />

            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand Logo & Name */}
                <div
                    onClick={() => handleNavClick('hero')}
                    className="group flex cursor-pointer items-center gap-3 select-none"
                >
                    <div className="relative">
                        <img
                            src="/images/anang-logo.png"
                            alt="Ridhwan Anang Logo"
                            className="size-8 object-contain rounded-lg border border-zinc-200 dark:border-white/10 transition-transform duration-200 group-hover:scale-105"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 border border-white dark:border-zinc-950" />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
                            Ridhwan Anang
                        </span>
                        <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-700/60">
                            v2.5
                        </span>
                    </div>
                </div>

                {/* Desktop Minimalist Floating Nav Dock */}
                <nav className="hidden items-center gap-0.5 rounded-xl border border-zinc-200/90 bg-white/80 p-1 shadow-2xs backdrop-blur-md md:flex dark:border-white/8 dark:bg-[#12141c]/80">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`relative z-10 flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                                    isActive
                                        ? 'text-zinc-950 dark:text-white font-semibold'
                                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavBackground"
                                        className="absolute inset-0 -z-10 rounded-lg bg-zinc-100 shadow-2xs border border-zinc-200/80 dark:bg-zinc-800 dark:border-white/10"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 450,
                                            damping: 35,
                                        }}
                                    />
                                )}
                                <Icon size={13} className={isActive ? 'text-violet-600 dark:text-violet-400' : 'opacity-70'} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}

                    <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />

                    <a
                        href="https://www.dicoding.com/users/riedmarf12/academies"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                        <span>Dicoding</span>
                        <ExternalLink size={10} className="opacity-60" />
                    </a>
                </nav>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="cursor-pointer rounded-lg border border-zinc-200/90 bg-white/80 p-2 text-zinc-700 shadow-2xs transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/8 dark:bg-[#12141c]/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        aria-label="Toggle tema gelap/terang"
                    >
                        {isDarkMode ? (
                            <Sun size={15} className="text-amber-400" />
                        ) : (
                            <Moon size={15} className="text-zinc-700" />
                        )}
                    </button>

                    {/* Quick Contact Button */}
                    <button
                        onClick={onOpenContact}
                        className="hidden cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-95 sm:inline-flex dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                    >
                        <Send size={12} />
                        <span>Hubungi</span>
                    </button>

                    {/* Mobile Hamburger Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="relative flex size-9 items-center justify-center rounded-lg border border-zinc-200/90 bg-white/80 shadow-2xs transition-all hover:bg-zinc-100 md:hidden dark:border-white/8 dark:bg-[#12141c]/80 cursor-pointer"
                        aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                    >
                        <div className="relative flex size-4 flex-col items-center justify-center gap-1">
                            <span
                                className={`h-0.5 w-4 rounded-full bg-zinc-700 transition-all duration-200 dark:bg-zinc-200 ${
                                    isMobileMenuOpen ? 'translate-y-[6px] rotate-45' : ''
                                }`}
                            />
                            <span
                                className={`h-0.5 w-4 rounded-full bg-zinc-700 transition-all duration-200 dark:bg-zinc-200 ${
                                    isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''
                                }`}
                            />
                            <span
                                className={`h-0.5 w-4 rounded-full bg-zinc-700 transition-all duration-200 dark:bg-zinc-200 ${
                                    isMobileMenuOpen ? '-translate-y-[6px] -rotate-45' : ''
                                }`}
                            />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Navigation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute top-full left-0 w-full border-b border-zinc-200 bg-white/95 px-4 py-4 shadow-xl backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-[#0c0e14]/95"
                    >
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeSection === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavClick(item.id)}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                                            isActive
                                                ? 'bg-zinc-100 text-zinc-950 font-bold dark:bg-zinc-800 dark:text-white'
                                                : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-850'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon size={14} className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-400'} />
                                            <span>{item.label}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-zinc-400" />
                                    </button>
                                );
                            })}

                            <a
                                href="https://www.dicoding.com/users/riedmarf12/academies"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-850"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Award size={14} className="text-zinc-400" />
                                    <span>Dicoding Profile</span>
                                </div>
                                <ExternalLink size={13} className="text-zinc-400" />
                            </a>
                        </div>

                        <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-white/10">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    onOpenContact();
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-2.5 text-xs font-semibold text-white transition-all active:scale-98 dark:bg-white dark:text-zinc-900"
                            >
                                <Send size={13} />
                                <span>Hubungi Saya</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
