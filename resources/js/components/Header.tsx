import {
    Moon,
    Sun,
    Award,
    Briefcase,
    Code,
    Home,
    Sparkles,
    Send,
    ChevronRight,
    Linkedin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

interface HeaderProps {
    onOpenContact: () => void;
    activeSection: string;
    setActiveSection: (section: string) => void;
    onSectionSelect?: (section: string, isManual?: boolean) => void;
    linkedinUrl?: string;
}

export default function Header({
    onOpenContact,
    activeSection,
    setActiveSection,
    onSectionSelect,
    linkedinUrl = 'https://www.linkedin.com/in/ridhwan-anang-ma-ruf/',
}: HeaderProps) {
    const { updateAppearance } = useAppearance();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const isScrolledRef = useRef(false);

    useEffect(() => {
        let rafId: number | null = null;
        let cachedScrollHeight = 0;

        const updateCachedDimensions = () => {
            cachedScrollHeight = Math.max(
                1,
                document.documentElement.scrollHeight - window.innerHeight,
            );
        };
        updateCachedDimensions();
        window.addEventListener('resize', updateCachedDimensions, {
            passive: true,
        });

        const handleScroll = () => {
            if (rafId !== null) return;

            rafId = requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const scrolled = scrollY > 15;

                if (scrolled !== isScrolledRef.current) {
                    isScrolledRef.current = scrolled;
                    setIsScrolled(scrolled);
                }

                if (progressBarRef.current && cachedScrollHeight > 0) {
                    const progress = Math.min(
                        Math.max(scrollY / cachedScrollHeight, 0),
                        1,
                    );
                    progressBarRef.current.style.transform = `scaleX(${progress})`;
                }

                rafId = null;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateCachedDimensions);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    const toggleTheme = () => {
        if (typeof document === 'undefined') return;
        const isCurrentDark =
            document.documentElement.classList.contains('dark');
        updateAppearance(isCurrentDark ? 'light' : 'dark');
    };

    const navItems = [
        { label: 'Tentang', id: 'hero', icon: Home },
        { label: 'Stack', id: 'tech-stack', icon: Code },
        { label: 'Portofolio', id: 'karya', icon: Briefcase },
        { label: 'Sertifikasi', id: 'sertifikat', icon: Award },
    ];

    const handleNavClick = (id: string) => {
        if (onSectionSelect) {
            onSectionSelect(id, true);
        } else {
            setActiveSection(id);
        }
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
        <motion.header
            id="main-header"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 left-0 z-45 w-full transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out ${
                isScrolled
                    ? 'border-b border-zinc-200/80 bg-white/85 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-blue-400/15 dark:bg-[#080e21]/85'
                    : 'border-b border-transparent bg-transparent py-3 shadow-none sm:py-3.5'
            }`}
        >
            {/* Top Scroll Progress Indicator (Sapphire to Champagne Gold) */}
            <div
                ref={progressBarRef}
                className="pointer-events-none absolute top-0 left-0 z-50 h-[2px] w-full origin-left bg-gradient-to-r from-blue-600 via-sky-400 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)] will-change-transform"
                style={{ transform: 'scaleX(0)' }}
            />

            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand Identity: Monogram Logo & Title */}
                <div
                    onClick={() => handleNavClick('hero')}
                    className="group flex cursor-pointer items-center gap-2.5 sm:gap-3 select-none"
                >
                    {/* Raw Contour-Shaped Brand Logo (No box/circle wrapper) */}
                    <div className="relative flex items-center justify-center">
                        <img
                            src="/images/anang-logo.png"
                            alt="Ridhwan Anang Logo"
                            className="size-8 sm:size-9 object-contain transition-all duration-300 group-hover:scale-105 [filter:drop-shadow(0_3px_8px_rgba(0,164,253,0.38))_drop-shadow(0_1px_3px_rgba(123,38,251,0.25))] dark:[filter:drop-shadow(0_0_12px_rgba(0,164,253,0.55))_drop-shadow(0_0_22px_rgba(123,38,251,0.35))]"
                        />
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="flex items-center font-brand">
                            <span className="text-[17px] sm:text-[18px] font-black tracking-[-0.025em] bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 dark:from-amber-300 dark:via-yellow-200 dark:to-amber-400 bg-clip-text text-transparent transition-all duration-300 group-hover:opacity-90 [filter:drop-shadow(0_1px_2px_rgba(180,83,9,0.12))] dark:[filter:drop-shadow(0_0_16px_rgba(245,158,11,0.35))]">
                                Ridhwan Anang
                            </span>
                        </div>

                        {/* Signature Dynamic Swoosh Underline Flourish (Sleret Melengkung) */}
                        <svg
                            viewBox="0 0 140 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="pointer-events-none -mt-0.5 h-2 w-full overflow-visible transition-all duration-300 group-hover:scale-x-105"
                        >
                            <defs>
                                <linearGradient id="headerSwooshGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
                                    <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.95" />
                                    <stop offset="85%" stopColor="#fbbf24" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.85" />
                                </linearGradient>
                                <linearGradient id="headerSwooshGradDark" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                                    <stop offset="45%" stopColor="#fde047" stopOpacity="1" />
                                    <stop offset="85%" stopColor="#fbbf24" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M 2 4 C 40 9.5, 96 9.5, 137 2.8"
                                stroke="url(#headerSwooshGradLight)"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                className="dark:hidden [filter:drop-shadow(0_1px_3px_rgba(245,158,11,0.35))]"
                            />
                            <path
                                d="M 2 4 C 40 9.5, 96 9.5, 137 2.8"
                                stroke="url(#headerSwooshGradDark)"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                className="hidden dark:block [filter:drop-shadow(0_0_6px_rgba(251,191,36,0.7))_drop-shadow(0_0_12px_rgba(56,189,248,0.4))]"
                            />
                            {/* Trailing energy spark dot at the flick */}
                            <circle
                                cx="138"
                                cy="2.8"
                                r="1.2"
                                className="fill-amber-500 dark:fill-sky-300"
                            />
                        </svg>
                    </div>
                </div>

                {/* Center Floating Pill Dock (Ultra-Luxury Glass Capsule) */}
                <nav className="hidden items-center gap-1 rounded-full border border-zinc-200/80 bg-white/80 p-1.5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-xl md:flex dark:border-blue-400/20 dark:bg-[#0c162f]/85 dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)]">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`relative z-10 flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 select-none ${
                                    isActive
                                        ? 'font-bold text-amber-700 dark:text-amber-300'
                                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-amber-200'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavBackground"
                                        className="absolute inset-0 -z-10 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.22)] dark:border-amber-400/50"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 380,
                                            damping: 32,
                                            mass: 0.8,
                                        }}
                                    />
                                )}
                                <Icon
                                    size={13}
                                    className={`transition-colors ${
                                        isActive
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'opacity-70 group-hover:opacity-100'
                                    }`}
                                />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Right Controls: LinkedIn, Theme Toggle & Gold CTA Button */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                    {/* Official LinkedIn Quick Link (Icon beside Theme Toggle) */}
                    {linkedinUrl && (
                        <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-zinc-200/80 bg-white/80 text-zinc-600 shadow-2xs backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] active:scale-95 dark:border-blue-400/20 dark:bg-[#0c162f]/80 dark:text-zinc-300 dark:hover:border-sky-400/50 dark:hover:bg-sky-500/10 dark:hover:text-sky-300 dark:hover:shadow-[0_0_12px_rgba(56,189,248,0.25)]"
                            aria-label="Profil LinkedIn Ridhwan Anang"
                            title="Kunjungi LinkedIn"
                        >
                            <Linkedin size={15} />
                        </a>
                    )}

                    {/* Refined Circular Theme Toggle Button (Hydration-Safe CSS Toggle) */}
                    <button
                        onClick={toggleTheme}
                        className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-zinc-200/80 bg-white/80 text-zinc-700 shadow-2xs backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-amber-400/50 active:scale-95 dark:border-blue-400/20 dark:bg-[#0c162f]/80 dark:text-amber-300 dark:hover:border-amber-400/40 dark:hover:shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                        aria-label="Toggle tema gelap/terang"
                    >
                        <Sun
                            size={15}
                            className="hidden text-amber-400 transition-transform duration-300 hover:rotate-45 dark:block"
                        />
                        <Moon
                            size={15}
                            className="block text-zinc-700 transition-transform duration-300 hover:-rotate-12 dark:hidden"
                        />
                    </button>

                    {/* Champagne Gold Luxury Pill CTA */}
                    <button
                        onClick={onOpenContact}
                        className="luxury-btn-primary hidden cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black tracking-wide sm:inline-flex"
                    >
                        <Send size={11} />
                        <span>Hubungi</span>
                    </button>

                    {/* Mobile Hamburger Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="relative flex size-9 cursor-pointer items-center justify-center rounded-full border border-zinc-200/80 bg-white/80 shadow-2xs backdrop-blur-md transition-all duration-200 hover:border-amber-400/40 md:hidden dark:border-blue-400/20 dark:bg-[#0c162f]/80"
                        aria-label={
                            isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'
                        }
                    >
                        <div className="relative flex size-4 flex-col items-center justify-center gap-1">
                            <span
                                className={`h-0.5 w-4 rounded-full bg-zinc-700 transition-all duration-200 dark:bg-zinc-200 ${
                                    isMobileMenuOpen
                                        ? 'translate-y-[6px] rotate-45 bg-amber-500 dark:bg-amber-400'
                                        : ''
                                }`}
                            />
                            <span
                                className={`h-0.5 w-4 rounded-full bg-zinc-700 transition-all duration-200 dark:bg-zinc-200 ${
                                    isMobileMenuOpen
                                        ? 'scale-x-0 opacity-0'
                                        : ''
                                }`}
                            />
                            <span
                                className={`h-0.5 w-4 rounded-full bg-zinc-700 transition-all duration-200 dark:bg-zinc-200 ${
                                    isMobileMenuOpen
                                        ? '-translate-y-[6px] -rotate-45 bg-amber-500 dark:bg-amber-400'
                                        : ''
                                }`}
                            />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Navigation (Frosted Luxury Vault Floating Panel) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="mx-4 mt-2 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/95 p-3 shadow-2xl backdrop-blur-2xl md:hidden dark:border-blue-400/25 dark:bg-[#0c162f]/98"
                    >
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeSection === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavClick(item.id)}
                                        className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                                            isActive
                                                ? 'border border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-amber-500/20 font-bold text-amber-700 shadow-xs dark:border-amber-400/40 dark:text-amber-300'
                                                : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-blue-400/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon
                                                size={15}
                                                className={
                                                    isActive
                                                        ? 'text-amber-600 dark:text-amber-400'
                                                        : 'text-zinc-400 dark:text-zinc-500'
                                                }
                                            />
                                            <span>{item.label}</span>
                                        </div>
                                        <ChevronRight
                                            size={14}
                                            className={
                                                isActive
                                                    ? 'text-amber-500 dark:text-amber-400'
                                                    : 'text-zinc-400 dark:text-zinc-600'
                                            }
                                        />
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-2.5 flex flex-col gap-2 border-t border-zinc-200/80 pt-2.5 dark:border-blue-400/15">
                            {linkedinUrl && (
                                <a
                                    href={linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50 py-2.5 text-xs font-semibold text-zinc-700 transition-all hover:bg-[#0A66C2] hover:text-white dark:border-blue-400/15 dark:bg-[#0c162f]/80 dark:text-zinc-300 dark:hover:bg-[#0A66C2] dark:hover:text-white"
                                >
                                    <Linkedin size={14} />
                                    <span>Kunjungi LinkedIn</span>
                                </a>
                            )}
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    onOpenContact();
                                }}
                                className="luxury-btn-primary flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black tracking-wide"
                            >
                                <Send size={12} />
                                <span>Hubungi Saya</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
