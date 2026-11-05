/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Head, Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import AIChatWidget from '../components/AIChatWidget';
import Certificates from '../components/Certificates';
import ContactModal from '../components/ContactModal';
import Header from '../components/Header';
import MainHero from '../components/MainHero';
import MouseAmbientAura from '../components/MouseAmbientAura';
import ProfileCard from '../components/ProfileCard';
import Projects from '../components/Projects';
import TechStack from '../components/TechStack';
import ServicesOverviewSection from '../components/ServicesOverviewSection';
import TrackingModal from '../components/TrackingModal';

interface WelcomeProps {
    initialProfile?: any;
    initialProjects?: any[];
    initialTechStacks?: any[];
    initialCertificates?: any[];
    initialPackages?: any[];
}

export default function Welcome({
    initialProfile,
    initialProjects = [],
    initialTechStacks = [],
    initialCertificates = [],
    initialPackages = [],
}: WelcomeProps) {
    const [activeSection, setActiveSection] = useState('hero');
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isTrackingOpen, setIsTrackingOpen] = useState(false);

    const [profile, setProfile] = useState<any>(initialProfile || null);
    const [projects, setProjects] = useState<any[]>(initialProjects);
    const [techStacks, setTechStacks] = useState<any[]>(initialTechStacks);
    const [certificates, setCertificates] = useState<any[]>(initialCertificates);
    const [packages, setPackages] = useState<any[]>(initialPackages);
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
            fetch('/api/service-packages').then((res) => res.json()).catch(() => []),
        ])
            .then(([profileData, projectsData, techStacksData, certificatesData, packagesData]) => {
                setProfile(profileData);
                setProjects(projectsData);
                setTechStacks(techStacksData);
                setCertificates(certificatesData);
                if (packagesData && packagesData.length > 0) {
                    setPackages(packagesData);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching dynamic data:', err);
                setLoading(false);
            });
    }, [initialProfile]);

    // Monitor section visibility via native IntersectionObserver (60fps, 0 scroll listeners, 0 forced reflows)
    useEffect(() => {
        const sections = ['hero', 'tech-stack', 'karya', 'sertifikat'];
        const sectionElements = sections
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);

        if (sectionElements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const intersecting = entries.filter((e) => e.isIntersecting);
                if (intersecting.length > 0) {
                    intersecting.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                    setActiveSection(intersecting[0].target.id);
                }
            },
            {
                root: null,
                rootMargin: '-15% 0px -40% 0px',
                threshold: [0, 0.25, 0.5, 0.75],
            }
        );

        sectionElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [loading]);

    return (
        <div
            id="app-root"
            className="relative min-h-screen overflow-x-hidden bg-[#F4F6FA] text-slate-800 transition-colors duration-300 selection:bg-violet-500/30 dark:bg-slate-950 dark:text-slate-100"
        >
            <Head>
                <title>Ridhwan Anang Ma'ruf</title>
            </Head>

            {/* Interactive Mouse follow highlight (Decoupled & GPU accelerated, 0 re-renders) */}
            <MouseAmbientAura />

            {/* Absolute Decorative Smooth Gradient Blur Mesh Circles (GPU accelerated) */}
            <div className="pointer-events-none absolute top-0 right-0 z-0 h-[500px] w-[500px] animate-pulse-glow rounded-full bg-gradient-to-l from-violet-300/15 via-blue-200/10 to-transparent blur-3xl transform-gpu will-change-transform dark:from-violet-950/20 dark:via-indigo-950/10 dark:to-transparent"></div>
            <div className="pointer-events-none absolute top-20 left-0 z-0 h-[450px] w-[450px] animate-pulse-glow rounded-full bg-gradient-to-r from-blue-300/10 via-purple-200/10 to-transparent blur-3xl [animation-delay:2s] transform-gpu will-change-transform dark:from-blue-950/10 dark:via-purple-950/10 dark:to-transparent"></div>

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
                    onOpenTracking={() => setIsTrackingOpen(true)}
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
                            <MainHero onOpenTracking={() => setIsTrackingOpen(true)} />
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
                    className="content-auto scroll-mt-28 border-t border-slate-200/40 pt-8 dark:border-slate-800/20"
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

                {/* Section: Jasa & Layanan Pembuatan Website (Overview & Paket) - Hidden per request (jangan dihapus) */}
                {/*
                <motion.div
                    id="layanan"
                    className="scroll-mt-28 border-t border-slate-200/40 pt-8 dark:border-slate-800/20"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.6,
                        ease: 'easeOut',
                        delay: 0.55,
                    }}
                >
                    <ServicesOverviewSection packages={packages} onOpenTracking={() => setIsTrackingOpen(true)} />
                </motion.div>
                */}

                {/* Section 4: Certificates Grid Wrapper (Full-width section below the grid) */}
                <motion.div
                    id="sertifikat"
                    className="content-auto scroll-mt-28"
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
            <footer className="content-auto mt-16 w-full border-t border-slate-200/70 bg-white/70 py-14 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/70">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 border-b border-slate-200/60 pb-10 sm:grid-cols-2 md:grid-cols-4 dark:border-slate-800/60">
                        {/* Brand / Name info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-xs font-black text-white shadow-xs">
                                    R
                                </span>
                                <h4 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                                    Ridhwan Anang Ma'ruf
                                </h4>
                            </div>
                            <p className="max-w-xs text-xs leading-relaxed text-slate-600 dark:text-slate-400">
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
                                <li>
                                    <a
                                        href="#sertifikat"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        Sertifikasi & Kelulusan
                                    </a>
                                </li>
                                {/* Hidden per request (jangan dihapus)
                                <li>
                                    <Link
                                        href="/layanan"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        Kalkulator Layanan
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => setIsTrackingOpen(true)}
                                        className="cursor-pointer transition-colors hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-1.5"
                                    >
                                        <span>Lacak Status Proyek</span>
                                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold uppercase">
                                            Resi
                                        </span>
                                    </button>
                                </li>
                                */}
                            </ul>
                        </div>

                        {/* Legal & Compliance */}
                        <div className="space-y-3">
                            <h5 className="text-xs font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                Legal & Kebijakan
                            </h5>
                            <ul className="text-slate-650 dark:text-slate-350 space-y-2 text-xs font-semibold">
                                <li>
                                    <Link
                                        href="/terms-and-conditions"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        Syarat & Ketentuan (T&C)
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/privacy-policy"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        Kebijakan Privasi
                                    </Link>
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

            {/* Quick Project Tracker Modal */}
            <TrackingModal
                isOpen={isTrackingOpen}
                onClose={() => setIsTrackingOpen(false)}
            />

            {/* Floating AI Chat Assistant widget */}
            <AIChatWidget />
        </div>
    );
}
