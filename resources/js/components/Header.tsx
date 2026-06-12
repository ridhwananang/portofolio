import { Moon, Sun, Menu, X, Award, Briefcase, Code, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface HeaderProps {
    onOpenContact: () => void;
    activeSection: string;
    setActiveSection: (section: string) => void;
}

export default function Header({
    onOpenContact,
    activeSection,
    setActiveSection,
}: HeaderProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        // Check initial dark mode preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)',
        ).matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
            
            // Calculate scroll progress percentage
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;

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
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    const navItems = [
        { label: 'Beranda', id: 'hero', icon: Home },
        { label: 'Tech Stack', id: 'tech-stack', icon: Code },
        { label: 'Karya', id: 'karya', icon: Briefcase },
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
                    ? 'border-b border-slate-200/40 bg-white/75 py-2.5 shadow-md shadow-slate-100/30 backdrop-blur-lg dark:border-slate-800/40 dark:bg-slate-950/75 dark:shadow-none'
                    : 'bg-transparent py-5'
            }`}
        >
            {/* Top Scroll Progress Indicator */}
            <div
                className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500 transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress}%` }}
            />

            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand Logo */}
                <div
                    onClick={() => handleNavClick('hero')}
                    className="group flex cursor-pointer items-center"
                >
                    <img
                        src="/images/anang.png"
                        alt="Anang Logo"
                        className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 [filter:drop-shadow(0px_2px_6px_rgba(0,0,0,0.15))] dark:[filter:drop-shadow(0px_2px_10px_rgba(139,92,246,0.35))]"
                    />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-1 rounded-2xl border border-slate-200/40 bg-slate-100/80 p-1.5 md:flex dark:border-slate-700/30 dark:bg-slate-800/60">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`relative flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 z-10 ${
                                    isActive
                                        ? 'text-slate-900 dark:text-white'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavBackground"
                                        className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm dark:bg-slate-700"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <Icon size={14} />
                                {item.label}
                            </button>
                        );
                    })}

                    <a
                        href="https://www.dicoding.com/users/riedmarf12/academies"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <Award size={14} />
                        Dicoding Profile
                    </a>
                </nav>

                {/* Right Interactions */}
                <div className="flex items-center gap-2">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="cursor-pointer rounded-xl border border-slate-200/50 bg-slate-100/80 p-2.5 text-slate-700 shadow-sm transition-all hover:scale-105 hover:text-violet-600 dark:border-slate-700/30 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-violet-400"
                        aria-label="Toggle tema gelap/terang"
                    >
                        {isDarkMode ? (
                            <Sun size={18} id="sun-theme-icon" />
                        ) : (
                            <Moon size={18} id="moon-theme-icon" />
                        )}
                    </button>

                    {/* Quick Contact Button */}
                    <button
                        onClick={onOpenContact}
                        className="hidden cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold tracking-wide text-white uppercase shadow-md transition-all hover:bg-slate-800 active:scale-95 sm:flex dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    >
                        Hubungi
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="cursor-pointer rounded-xl border border-slate-200/50 bg-slate-100/80 p-2.5 text-slate-700 md:hidden dark:border-slate-700/30 dark:bg-slate-800/80 dark:text-slate-300"
                        aria-label="Buka menu navigasi"
                    >
                        {isMobileMenuOpen ? (
                            <X size={18} />
                        ) : (
                            <Menu size={18} />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div
                    id="mobile-nav-panel"
                    className="animate-slide-down absolute top-full left-0 w-full space-y-2 border-b border-slate-200 bg-white px-4 py-4 shadow-lg backdrop-blur-md md:hidden dark:border-slate-800/80 dark:bg-slate-900/95"
                >
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                                    isActive
                                        ? 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400'
                                        : 'dark:hover:bg-slate-850 text-slate-600 hover:bg-slate-50 dark:text-slate-400'
                                }`}
                            >
                                <Icon size={16} />
                                {item.label}
                            </button>
                        );
                    })}

                    <a
                        href="https://www.dicoding.com/users/riedmarf12/academies"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dark:hover:bg-slate-850 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <Award size={16} />
                        Dicoding Profile
                    </a>

                    <button
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            onOpenContact();
                        }}
                        className="mt-2 flex w-full items-center justify-center rounded-xl bg-slate-900 py-3 text-xs font-bold tracking-wide text-white uppercase shadow-md transition-all dark:bg-white dark:text-slate-900"
                    >
                        Hubungi Saya
                    </button>
                </div>
            )}
        </header>
    );
}
