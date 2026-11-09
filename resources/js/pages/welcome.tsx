/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Head, Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import AIChatWidget from '../components/AIChatWidget';
import Certificates from '../components/Certificates';
import ContactModal from '../components/ContactModal';
import Header from '../components/Header';
import MainHero from '../components/MainHero';
import MouseAmbientAura from '../components/MouseAmbientAura';
import ProfileCard from '../components/ProfileCard';
import Projects from '../components/Projects';
import TechStack from '../components/TechStack';
import { Sparkles } from 'lucide-react';

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

    const [profile, setProfile] = useState<any>(initialProfile || null);
    const [projects, setProjects] = useState<any[]>(Array.isArray(initialProjects) ? initialProjects : []);
    const [techStacks, setTechStacks] = useState<any[]>(Array.isArray(initialTechStacks) ? initialTechStacks : []);
    const [certificates, setCertificates] = useState<any[]>(Array.isArray(initialCertificates) ? initialCertificates : []);
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
                setProfile(profileData && !profileData.message ? profileData : null);
                setProjects(Array.isArray(projectsData) ? projectsData : []);
                setTechStacks(Array.isArray(techStacksData) ? techStacksData : []);
                setCertificates(Array.isArray(certificatesData) ? certificatesData : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching dynamic data:', err);
                setLoading(false);
            });
    }, [initialProfile]);

    // Programmatic scroll lock to prevent frantic tab jumping during navigation clicks
    const isManualNavRef = useRef(false);
    const manualNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSectionSelect = (id: string, isManual = false) => {
        setActiveSection(id);
        if (isManual) {
            isManualNavRef.current = true;
            if (manualNavTimerRef.current) clearTimeout(manualNavTimerRef.current);
            manualNavTimerRef.current = setTimeout(() => {
                isManualNavRef.current = false;
            }, 850);
        }
    };

    // Monitor section visibility via native IntersectionObserver
    useEffect(() => {
        const sections = ['hero', 'tech-stack', 'karya', 'sertifikat'];
        const sectionElements = sections
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);

        if (sectionElements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (isManualNavRef.current) return;
                const intersecting = entries.filter((e) => e.isIntersecting);
                if (intersecting.length > 0) {
                    intersecting.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                    const bestId = intersecting[0].target.id;
                    setActiveSection((prev) => (prev !== bestId ? bestId : prev));
                }
            },
            {
                root: null,
                rootMargin: '-20% 0px -40% 0px',
                threshold: [0.1, 0.5],
            }
        );

        sectionElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [loading]);

    return (
        <div
            id="app-root"
            className="relative min-h-screen overflow-x-hidden bg-[#fafafa] text-zinc-900 transition-colors duration-200 selection:bg-amber-400 selection:text-zinc-950 dark:bg-[#080e21] dark:text-zinc-100 dark:selection:bg-amber-400 dark:selection:text-zinc-950"
        >
            <Head>
                <title>Ridhwan Anang Ma'ruf — Full Stack Software Engineer</title>
                <meta
                    name="description"
                    content="Full Stack Software Engineer specializing in high-performance Laravel backend architectures, responsive React SPA interfaces, and clean cloud infrastructure."
                />
            </Head>

            {/* Architectural Grid & Ambient Canvas */}
            <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#38bdf80f_1px,transparent_1px),linear-gradient(to_bottom,#38bdf80f_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-70"></div>
            <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#fbbf2412_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

            {/* Interactive Mouse follow highlight (Decoupled & GPU accelerated, 0 re-renders) */}
            <MouseAmbientAura />

            {/* Luminous Ambient Light Fountains (Deep Blue & Champagne Gold) */}
            <div className="pointer-events-none absolute -top-40 right-[-10%] z-0 h-[700px] w-[700px] rounded-full bg-gradient-to-bl from-blue-600/25 via-indigo-700/15 to-transparent blur-[120px] transform-gpu will-change-transform dark:from-blue-600/30 dark:via-blue-800/18"></div>
            <div className="pointer-events-none absolute top-40 left-[-10%] z-0 h-[650px] w-[650px] rounded-full bg-gradient-to-br from-amber-500/18 via-yellow-500/10 to-transparent blur-[120px] transform-gpu will-change-transform dark:from-amber-500/18 dark:via-yellow-600/10"></div>
            <div className="pointer-events-none absolute top-[900px] left-[25%] z-0 h-[500px] w-[800px] rounded-full bg-gradient-to-r from-blue-900/20 via-indigo-900/15 to-transparent blur-[140px] transform-gpu will-change-transform dark:from-blue-900/25 dark:via-indigo-950/18"></div>

            {/* Main Header Navigation (Root viewport fixed, eliminating transformed containing block) */}
            <Header
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                onSectionSelect={handleSectionSelect}
                onOpenContact={() => setIsContactOpen(true)}
            />

            {/* Main Showcase Layout Wrapper */}
            <main className="relative z-10 mx-auto max-w-7xl space-y-10 px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                {/* Hero & Identity Bento Tier (Balanced 2-Column Grid) */}
                <div id="hero" className="scroll-mt-24">
                    <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
                        {/* Left Column (Author Profile Card - 4 slots wide) */}
                        <motion.div
                            className="z-20 flex flex-col lg:col-span-4"
                            initial={{ x: -16, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                                duration: 0.45,
                                ease: 'easeOut',
                                delay: 0.05,
                            }}
                        >
                            <ProfileCard
                                profile={profile}
                                loading={loading}
                                onOpenContact={() => setIsContactOpen(true)}
                            />
                        </motion.div>

                        {/* Right Column (Hero Dossier - 8 slots wide) */}
                        <motion.div
                            className="flex flex-col lg:col-span-8"
                            initial={{ x: 16, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                                duration: 0.45,
                                ease: 'easeOut',
                                delay: 0.1,
                            }}
                        >
                            <MainHero
                                onOpenContact={() => setIsContactOpen(true)}
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Section 2: Technical Stack Console (Full-Width Section) */}
                <motion.div
                    id="tech-stack"
                    className="scroll-mt-24 border-t border-zinc-200/80 pt-8 dark:border-blue-400/15"
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.45,
                        ease: 'easeOut',
                        delay: 0.2,
                    }}
                >
                    <TechStack
                        techStacks={techStacks}
                        loading={loading}
                    />
                </motion.div>

                {/* Section 3: Project Cases List Wrapper */}
                <motion.div
                    id="karya"
                    className="scroll-mt-24 border-t border-zinc-200/80 pt-8 dark:border-blue-400/15"
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.45,
                        ease: 'easeOut',
                        delay: 0.3,
                    }}
                >
                    <Projects projects={projects} loading={loading} />
                </motion.div>

                {/* Section 4: Certificates Grid Wrapper */}
                <motion.div
                    id="sertifikat"
                    className="scroll-mt-24 border-t border-zinc-200/80 pt-8 dark:border-blue-400/15"
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.45,
                        ease: 'easeOut',
                        delay: 0.4,
                    }}
                >
                    <Certificates certificates={certificates} loading={loading} />
                </motion.div>
            </main>

            {/* Aesthetic Distinctive Luxury Footer (Midnight Deep Blue & Gold Vault) */}
            <footer className="mt-20 w-full border-t-2 border-amber-500/40 bg-zinc-50/95 py-14 shadow-[0_-12px_40px_rgba(245,158,11,0.08)] dark:bg-gradient-to-b dark:from-[#050a18] dark:via-[#081226] dark:to-[#03060f] relative overflow-hidden">
                <div className="specular-top" />
                {/* Ambient Golden Crown Spotlight */}
                <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-[600px] rounded-full bg-gradient-to-b from-amber-500/20 via-blue-500/08 to-transparent blur-3xl" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 gap-8 border-b border-zinc-200/80 pb-10 sm:grid-cols-2 md:grid-cols-4 dark:border-blue-400/15">
                        {/* Brand / Name info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5">
                                <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 text-xs font-black text-zinc-950 shadow-md shadow-amber-500/25">
                                    R
                                </span>
                                <h4 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Ridhwan Anang Ma'ruf
                                </h4>
                            </div>
                            <p className="max-w-xs text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                                Full Stack Software Engineer yang berfokus membangun sistem backend Laravel yang andal dan antarmuka SPA React yang reaktif.
                            </p>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 shadow-2xs">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>All Systems Operational</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="space-y-2.5">
                            <h5 className="text-[10.5px] font-mono uppercase tracking-wider text-amber-500/90 dark:text-amber-400/90 font-bold">
                                Navigasi
                            </h5>
                            <ul className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                <li>
                                    <a
                                        href="#hero"
                                        className="transition-colors hover:text-amber-600 dark:hover:text-amber-300"
                                    >
                                        Profil & Ringkasan
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#tech-stack"
                                        className="transition-colors hover:text-amber-600 dark:hover:text-amber-300"
                                    >
                                        Tech Stack
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#karya"
                                        className="transition-colors hover:text-amber-600 dark:hover:text-amber-300"
                                    >
                                        Proyek Unggulan
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#sertifikat"
                                        className="transition-colors hover:text-amber-600 dark:hover:text-amber-300"
                                    >
                                        Sertifikasi & Lisensi
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Legal & Compliance */}
                        <div className="space-y-2.5">
                            <h5 className="text-[10.5px] font-mono uppercase tracking-wider text-amber-500/90 dark:text-amber-400/90 font-bold">
                                Kebijakan & Dokumen
                            </h5>
                            <ul className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                <li>
                                    <Link
                                        href="/terms-and-conditions"
                                        className="transition-colors hover:text-amber-600 dark:hover:text-amber-300"
                                    >
                                        Syarat & Ketentuan (T&C)
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/privacy-policy"
                                        className="transition-colors hover:text-amber-600 dark:hover:text-amber-300"
                                    >
                                        Kebijakan Privasi
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="/images/Profile.pdf"
                                        download="Ridhwan_Anang_Maruf_Resume.pdf"
                                        className="transition-colors hover:text-amber-600 dark:hover:text-amber-300"
                                    >
                                        Curriculum Vitae (PDF)
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contacts / Quick links */}
                        <div className="space-y-2.5">
                            <h5 className="text-[10.5px] font-mono uppercase tracking-wider text-amber-500/90 dark:text-amber-400/90 font-bold">
                                Kontak
                            </h5>
                            <ul className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                <li>
                                    <a
                                        href="mailto:ridhwananang@gmail.com"
                                        className="transition-colors hover:text-amber-600 dark:hover:text-amber-300 font-mono"
                                    >
                                        ridhwananang@gmail.com
                                    </a>
                                </li>
                                <li className="text-zinc-500 dark:text-zinc-400">
                                    Tangerang Selatan, Indonesia
                                </li>
                                <li className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsContactOpen(true)}
                                        className="luxury-btn-primary cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-black tracking-wide"
                                    >
                                        <Sparkles size={12} />
                                        <span>Buka Dialog Kontak</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright footer bottom */}
                    <div className="flex flex-col items-center justify-between gap-4 pt-6 text-xs text-zinc-500 sm:flex-row dark:text-zinc-500">
                        <p>
                            © {new Date().getFullYear()} Ridhwan Anang Ma'ruf. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 font-medium">
                            <a
                                href="https://github.com/ridhwananang"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-colors hover:text-amber-600 dark:hover:text-amber-300"
                            >
                                GitHub
                            </a>
                            <a
                                href="https://www.linkedin.com/in/ridhwan-anang-ma-ruf/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-colors hover:text-[#0A66C2] dark:hover:text-sky-400"
                            >
                                LinkedIn
                            </a>
                            <a
                                href="https://www.dicoding.com/users/riedmarf12/academies"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
                            >
                                Dicoding
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Integrated Contact Drawer */}
            <ContactModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
                profileEmail={profile?.email || 'ridhwananang@gmail.com'}
                whatsappNumber="081298502177"
                linkedinUrl={profile?.linkedin_url || 'https://www.linkedin.com/in/ridhwan-anang-ma-ruf/'}
                githubUrl={profile?.github_url || 'https://github.com/ridhwananang'}
            />

            {/* Floating AI Chat Assistant widget */}
            <AIChatWidget />
        </div>
    );
}
