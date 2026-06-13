/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Head } from '@inertiajs/react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import AIChatWidget from '../components/AIChatWidget';
import Certificates from '../components/Certificates';
import ContactModal from '../components/ContactModal';
import Header from '../components/Header';
import MainHero from '../components/MainHero';
import ProfileCard from '../components/ProfileCard';
import Projects from '../components/Projects';
import TechStack from '../components/TechStack';

interface WelcomeProps {
    initialProfile?: any;
    initialProjects?: any[];
    initialTechStacks?: any[];
    initialCertificates?: any[];
}

export default function Welcome({
    initialProfile,
    initialProjects = [],
    initialTechStacks = [],
    initialCertificates = [],
}: WelcomeProps) {
    const [activeSection, setActiveSection] = useState('hero');
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const [profile, setProfile] = useState<any>(initialProfile || null);
    const [projects, setProjects] = useState<any[]>(initialProjects);
    const [techStacks, setTechStacks] = useState<any[]>(initialTechStacks);
    const [certificates, setCertificates] = useState<any[]>(initialCertificates);
    const [loading, setLoading] = useState(!initialProfile);

    useEffect(() => {
        if (initialProfile) {
            setLoading(false);
            return;
        }

        Promise.all([
            fetch('/api/profile').then((res) => res.json()),
            fetch('/api/projects').then((res) => res.json()),
            fetch('/api/tech-stacks').then((res) => res.json()),
            fetch('/api/certificates').then((res) => res.json()),
        ])
            .then(([profileData, projectsData, techStacksData, certificatesData]) => {
                setProfile(profileData);
                setProjects(projectsData);
                setTechStacks(techStacksData);
                setCertificates(certificatesData);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching dynamic data:', err);
                setLoading(false);
            });
    }, [initialProfile]);

    // Track mouse cursor to create mouse-following ambient aura
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Monitor scrolling to highlight correct navigation item dynamically
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200; // Offset for trigger

            const sections = ['hero', 'tech-stack', 'karya', 'sertifikat'];

            for (const section of sections) {
                const element = document.getElementById(section);

                if (element) {
                    const top = element.offsetTop;
                    const height = element.offsetHeight;

                    if (
                        scrollPosition >= top &&
                        scrollPosition < top + height
                    ) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            id="app-root"
            className="relative min-h-screen overflow-x-hidden bg-[#F4F6FA] text-slate-800 transition-colors duration-300 selection:bg-violet-500/30 dark:bg-slate-950 dark:text-slate-100"
        >
            <Head>
                <title>Ridhwan Anang Ma'ruf</title>
                <meta name="description" content="Portfolio resmi Ridhwan Anang Ma'ruf, Fullstack Developer spesialis Laravel & React. Membangun aplikasi web skala produksi yang andal." />
                <link rel="canonical" href="https://ridhwananang.id/" />
            </Head>

            {/* Visually Hidden H1 for SEO/AIO & Assistive Technologies */}
            <h1 className="sr-only">
                Ridhwan Anang Ma'ruf - Fullstack Web Developer Portfolio (Laravel & React)
            </h1>

            {/* Interactive Mouse follow highlight (Hidden on mobile/tablet) */}
            <div
                className="pointer-events-none fixed inset-0 z-0 hidden opacity-70 transition-opacity duration-300 md:block"
                style={{
                    background: `radial-gradient(700px at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.03), transparent 70%)`,
                }}
            />

            {/* Absolute Decorative Smooth Gradient Blur Mesh Circles (Matches screenshot aura) */}
            <div className="pointer-events-none absolute top-0 right-0 z-0 h-[500px] w-[500px] animate-pulse-glow rounded-full bg-gradient-to-l from-violet-300/15 via-blue-200/10 to-transparent blur-[120px] dark:from-violet-950/20 dark:via-indigo-950/10 dark:to-transparent"></div>
            <div className="pointer-events-none absolute top-20 left-0 z-0 h-[450px] w-[450px] animate-pulse-glow rounded-full bg-gradient-to-r from-blue-300/10 via-purple-200/10 to-transparent blur-[100px] [animation-delay:2s] dark:from-blue-950/10 dark:via-purple-950/10 dark:to-transparent"></div>

            {/* Main Responsive Header Navigation */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <Header
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    onOpenContact={() => setIsContactOpen(true)}
                />
            </motion.div>

            {/* Main Showcase Layout Wrapper with staggered page entrance */}
            <main className="relative z-10 mx-auto max-w-7xl space-y-16 px-4 pt-28 pb-16 sm:px-6 lg:px-8">
                {/* Core two-column grid (Matches screenshot structure) */}
                <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
                    {/* Left Column (Sticky Author Profile Card - 4 slots wide) */}
                    <motion.div
                        className="z-20 h-fit md:sticky md:top-24 md:col-span-4"
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            duration: 0.7,
                            ease: 'easeOut',
                            delay: 0.1,
                        }}
                    >
                        <ProfileCard
                            profile={profile}
                            loading={loading}
                            onOpenContact={() => setIsContactOpen(true)}
                        />
                    </motion.div>

                    {/* Right Column (Scrollable details grids - 8 slots wide) */}
                    <div className="space-y-8 md:col-span-8">
                        {/* Section 1: Hero Greetings Wrapper */}
                        <motion.div
                            id="hero"
                            className="scroll-mt-28"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                duration: 0.6,
                                ease: 'easeOut',
                                delay: 0.2,
                            }}
                        >
                            <MainHero />
                        </motion.div>

                        {/* Section 2: Technical Grid Wrapper */}
                        <motion.div
                            id="tech-stack"
                            className="scroll-mt-28"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                duration: 0.6,
                                ease: 'easeOut',
                                delay: 0.35,
                            }}
                        >
                            <TechStack
                                techStacks={techStacks}
                                loading={loading}
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Section 3: Project Cases List Wrapper (Full-width section below the grid) */}
                <motion.div
                    id="karya"
                    className="scroll-mt-28 border-t border-slate-200/40 pt-8 dark:border-slate-800/20"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.6,
                        ease: 'easeOut',
                        delay: 0.5,
                    }}
                >
                    <Projects projects={projects} loading={loading} />
                </motion.div>

                {/* Section 4: Certificates Grid Wrapper (Full-width section below the grid) */}
                <motion.div
                    id="sertifikat"
                    className="scroll-mt-28"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.6,
                        ease: 'easeOut',
                        delay: 0.6,
                    }}
                >
                    <Certificates certificates={certificates} loading={loading} />
                </motion.div>
            </main>

            {/* Aesthetic Footer Area */}
            <footer className="mt-2 w-full border-t border-slate-200/50 bg-white/40 py-12 backdrop-blur-md dark:border-slate-800/45 dark:bg-slate-950/40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 border-b border-slate-200/50 pb-8 md:grid-cols-3 dark:border-slate-800/45">
                        {/* Brand / Name info */}
                        <div className="space-y-3">
                            <h4 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Ridhwan Anang Ma'ruf
                            </h4>
                            <p className="max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                Fullstack Web Developer yang berdedikasi
                                membangun sistem backend Laravel yang andal dan
                                antarmuka SPA React yang interaktif.
                            </p>
                        </div>

                        {/* Navigation Links */}
                        <div className="space-y-3">
                            <h5 className="text-xs font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                Navigasi
                            </h5>
                            <ul className="text-slate-650 dark:text-slate-350 space-y-2 text-xs font-semibold">
                                <li>
                                    <a
                                        href="#hero"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        Tentang
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#tech-stack"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        Tech Stack
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#karya"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        Portofolio
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contacts / Quick links */}
                        <div className="space-y-3">
                            <h5 className="text-xs font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                Hubungi Saya
                            </h5>
                            <ul className="text-slate-650 dark:text-slate-350 space-y-2 text-xs font-semibold">
                                <li>
                                    <a
                                        href="mailto:ridhwananang@gmail.com"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        ridhwananang@gmail.com
                                    </a>
                                </li>
                                <li className="text-slate-500 dark:text-slate-400">
                                    Tangerang Selatan, Indonesia
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright footer bottom */}
                    <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs font-semibold text-slate-500 sm:flex-row dark:text-slate-500">
                        <p>
                            © {new Date().getFullYear()} Ridhwan Anang Ma'ruf.
                            All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/ridhwananang"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-colors hover:text-slate-900 dark:hover:text-white"
                            >
                                GitHub
                            </a>
                            <a
                                href="https://www.linkedin.com/in/ridhwan-anang-ma-ruf/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-colors hover:text-[#0A66C2]"
                            >
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Integrated Contact form & AI chat Drawer */}
            <ContactModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
            />

            {/* Floating AI Chat Assistant widget */}
            <AIChatWidget />
        </div>
    );
}
