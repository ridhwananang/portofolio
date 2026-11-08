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
import TrackingModal from '../components/TrackingModal';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

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
    const [projects, setProjects] = useState<any[]>(Array.isArray(initialProjects) ? initialProjects : []);
    const [techStacks, setTechStacks] = useState<any[]>(Array.isArray(initialTechStacks) ? initialTechStacks : []);
    const [certificates, setCertificates] = useState<any[]>(Array.isArray(initialCertificates) ? initialCertificates : []);
    const [packages, setPackages] = useState<any[]>(Array.isArray(initialPackages) ? initialPackages : []);
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
                setProfile(profileData && !profileData.message ? profileData : null);
                setProjects(Array.isArray(projectsData) ? projectsData : []);
                setTechStacks(Array.isArray(techStacksData) ? techStacksData : []);
                setCertificates(Array.isArray(certificatesData) ? certificatesData : []);
                if (Array.isArray(packagesData) && packagesData.length > 0) {
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
            className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-800 transition-colors duration-300 selection:bg-violet-500/25 dark:bg-[#0B0F19] dark:text-slate-100"
        >
            <Head>
                <title>Ridhwan Anang Ma'ruf — Full Stack Software Engineer</title>
                <meta
                    name="description"
                    content="Full Stack Software Engineer specializing in high-performance Laravel backend architectures, responsive React SPA interfaces, and clean cloud infrastructure."
                />
            </Head>

            {/* Subtle Architectural Dot Grid Pattern Background */}
            <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] opacity-50"></div>

            {/* Interactive Mouse follow highlight (Decoupled & GPU accelerated, 0 re-renders) */}
            <MouseAmbientAura />

            {/* Absolute Decorative Smooth Gradient Blur Mesh Circles (GPU accelerated) */}
            <div className="pointer-events-none absolute top-0 right-0 z-0 h-[600px] w-[600px] rounded-full bg-gradient-to-l from-violet-400/10 via-indigo-400/5 to-transparent blur-3xl transform-gpu will-change-transform dark:from-violet-600/15 dark:via-indigo-600/5 dark:to-transparent"></div>
            <div className="pointer-events-none absolute top-32 left-0 z-0 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-blue-400/10 via-emerald-400/5 to-transparent blur-3xl transform-gpu will-change-transform dark:from-blue-600/10 dark:via-emerald-600/5 dark:to-transparent"></div>

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
                {/* Core two-column grid */}
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
                    className="content-auto scroll-mt-28 border-t border-slate-200/50 pt-10 dark:border-white/10"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.6,
                        ease: 'easeOut',
                        delay: 0.45,
                    }}
                >
                    <Projects projects={projects} loading={loading} />
                </motion.div>

                {/* Section 4: Certificates Grid Wrapper (Full-width section below the grid) */}
                <motion.div
                    id="sertifikat"
                    className="content-auto scroll-mt-28"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.6,
                        ease: 'easeOut',
                        delay: 0.55,
                    }}
                >
                    <Certificates certificates={certificates} loading={loading} />
                </motion.div>
            </main>

            {/* Aesthetic Footer Area */}
            <footer className="content-auto mt-20 w-full border-t border-slate-200/80 bg-white/80 py-14 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-10 border-b border-slate-200/70 pb-12 sm:grid-cols-2 md:grid-cols-4 dark:border-white/10">
                        {/* Brand / Name info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-xs font-black text-white shadow-md shadow-violet-500/20">
                                    R
                                </span>
                                <h4 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                                    Ridhwan Anang Ma'ruf
                                </h4>
                            </div>
                            <p className="max-w-xs text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                Full Stack Software Engineer yang berfokus membangun arsitektur backend Laravel yang andal, aman, dan antarmuka SPA React yang reaktif.
                            </p>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-[10.5px] font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                </span>
                                <span>All Systems Operational</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="space-y-3">
                            <h5 className="text-[11px] font-mono font-extrabold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                Navigasi
                            </h5>
                            <ul className="space-y-2 text-xs font-semibold text-slate-650 dark:text-slate-350">
                                <li>
                                    <a
                                        href="#hero"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        Profil & Ringkasan
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#tech-stack"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        Stack Teknologi
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#karya"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        Proyek Unggulan
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#sertifikat"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        Sertifikasi & Lisensi
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Legal & Compliance */}
                        <div className="space-y-3">
                            <h5 className="text-[11px] font-mono font-extrabold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                Kebijakan & Dokumen
                            </h5>
                            <ul className="space-y-2 text-xs font-semibold text-slate-650 dark:text-slate-350">
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
                                <li>
                                    <a
                                        href="/images/Profile.pdf"
                                        download="Ridhwan_Anang_Maruf_Resume.pdf"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        Curriculum Vitae (PDF)
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contacts / Quick links */}
                        <div className="space-y-3">
                            <h5 className="text-[11px] font-mono font-extrabold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                Hubungi Saya
                            </h5>
                            <ul className="space-y-2 text-xs font-semibold text-slate-650 dark:text-slate-350">
                                <li>
                                    <a
                                        href="mailto:ridhwananang@gmail.com"
                                        className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                                    >
                                        ridhwananang@gmail.com
                                    </a>
                                </li>
                                <li className="text-slate-500 dark:text-slate-400">
                                    Tangerang Selatan, Banten, Indonesia
                                </li>
                                <li className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsContactOpen(true)}
                                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-violet-600 dark:bg-white dark:text-slate-900 dark:hover:bg-violet-400 dark:hover:text-slate-950 active:scale-95"
                                    >
                                        <Sparkles size={13} />
                                        <span>Buka Dialog Kontak</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright footer bottom */}
                    <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs font-semibold text-slate-500 sm:flex-row dark:text-slate-500">
                        <p>
                            © {new Date().getFullYear()} Ridhwan Anang Ma'ruf. All rights reserved.
                        </p>
                        <div className="flex items-center gap-5">
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
                            <a
                                href="https://www.dicoding.com/users/riedmarf12/academies"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                            >
                                Dicoding
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Integrated Modern Split Contact Drawer */}
            <ContactModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
                profileEmail={profile?.email || 'ridhwananang@gmail.com'}
                linkedinUrl={profile?.linkedin_url || 'https://www.linkedin.com/in/ridhwan-anang-ma-ruf/'}
                githubUrl={profile?.github_url || 'https://github.com/ridhwananang'}
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
