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
import { Sparkles } from 'lucide-react';

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

    // Monitor section visibility via native IntersectionObserver
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
            className="relative min-h-screen overflow-x-hidden bg-[#fafafa] text-zinc-800 transition-colors duration-200 selection:bg-zinc-900 selection:text-white dark:bg-[#090b10] dark:text-zinc-100 dark:selection:bg-white dark:selection:text-zinc-900"
        >
            <Head>
                <title>Ridhwan Anang Ma'ruf — Full Stack Software Engineer</title>
                <meta
                    name="description"
                    content="Full Stack Software Engineer specializing in high-performance Laravel backend architectures, responsive React SPA interfaces, and clean cloud infrastructure."
                />
            </Head>

            {/* Subtle Architectural Dot Grid Pattern Background */}
            <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(#181b26_1px,transparent_1px)] opacity-55"></div>

            {/* Interactive Mouse follow highlight (Decoupled & GPU accelerated, 0 re-renders) */}
            <MouseAmbientAura />

            {/* Subtle Lighting Accents (GPU accelerated) */}
            <div className="pointer-events-none absolute top-0 right-0 z-0 h-[450px] w-[450px] rounded-full bg-gradient-to-l from-violet-500/8 via-indigo-500/4 to-transparent blur-3xl transform-gpu will-change-transform dark:from-violet-500/10 dark:via-indigo-500/5"></div>
            <div className="pointer-events-none absolute top-28 left-0 z-0 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-blue-500/8 via-emerald-500/4 to-transparent blur-3xl transform-gpu will-change-transform dark:from-blue-500/8 dark:via-emerald-500/4"></div>

            {/* Main Header Navigation */}
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                <Header
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    onOpenContact={() => setIsContactOpen(true)}
                    onOpenTracking={() => setIsTrackingOpen(true)}
                />
            </motion.div>

            {/* Main Showcase Layout Wrapper */}
            <main className="relative z-10 mx-auto max-w-7xl space-y-12 px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                {/* Core two-column grid */}
                <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
                    {/* Left Column (Sticky Author Profile Card - 4 slots wide) */}
                    <motion.div
                        className="z-20 h-fit md:sticky md:top-20 md:col-span-4"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            duration: 0.5,
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

                    {/* Right Column (Scrollable details grids - 8 slots wide) */}
                    <div className="space-y-6 md:col-span-8">
                        {/* Section 1: Hero Greetings Wrapper */}
                        <motion.div
                            id="hero"
                            className="scroll-mt-24"
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                duration: 0.5,
                                ease: 'easeOut',
                                delay: 0.1,
                            }}
                        >
                            <MainHero onOpenTracking={() => setIsTrackingOpen(true)} />
                        </motion.div>

                        {/* Section 2: Technical Grid Wrapper */}
                        <motion.div
                            id="tech-stack"
                            className="scroll-mt-24"
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                duration: 0.5,
                                ease: 'easeOut',
                                delay: 0.2,
                            }}
                        >
                            <TechStack
                                techStacks={techStacks}
                                loading={loading}
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Section 3: Project Cases List Wrapper */}
                <motion.div
                    id="karya"
                    className="content-auto scroll-mt-24 border-t border-zinc-200/80 pt-8 dark:border-white/10"
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: 'easeOut',
                        delay: 0.3,
                    }}
                >
                    <Projects projects={projects} loading={loading} />
                </motion.div>

                {/* Section 4: Certificates Grid Wrapper */}
                <motion.div
                    id="sertifikat"
                    className="content-auto scroll-mt-24"
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: 'easeOut',
                        delay: 0.4,
                    }}
                >
                    <Certificates certificates={certificates} loading={loading} />
                </motion.div>
            </main>

            {/* Aesthetic Minimal Footer */}
            <footer className="content-auto mt-16 w-full border-t border-zinc-200/90 bg-white/90 py-12 backdrop-blur-md dark:border-white/10 dark:bg-[#0c0e14]/90">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 border-b border-zinc-200/80 pb-10 sm:grid-cols-2 md:grid-cols-4 dark:border-white/10">
                        {/* Brand / Name info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-950">
                                    R
                                </span>
                                <h4 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Ridhwan Anang Ma'ruf
                                </h4>
                            </div>
                            <p className="max-w-xs text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                                Full Stack Software Engineer yang berfokus membangun sistem backend Laravel yang andal dan antarmuka SPA React yang reaktif.
                            </p>
                            <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>All Systems Operational</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="space-y-2.5">
                            <h5 className="text-[10.5px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                Navigasi
                            </h5>
                            <ul className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                <li>
                                    <a
                                        href="#hero"
                                        className="transition-colors hover:text-zinc-950 dark:hover:text-white"
                                    >
                                        Profil & Ringkasan
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#tech-stack"
                                        className="transition-colors hover:text-zinc-950 dark:hover:text-white"
                                    >
                                        Tech Stack
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#karya"
                                        className="transition-colors hover:text-zinc-950 dark:hover:text-white"
                                    >
                                        Proyek Unggulan
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#sertifikat"
                                        className="transition-colors hover:text-zinc-950 dark:hover:text-white"
                                    >
                                        Sertifikasi & Lisensi
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Legal & Compliance */}
                        <div className="space-y-2.5">
                            <h5 className="text-[10.5px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                Kebijakan & Dokumen
                            </h5>
                            <ul className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                <li>
                                    <Link
                                        href="/terms-and-conditions"
                                        className="transition-colors hover:text-zinc-950 dark:hover:text-white"
                                    >
                                        Syarat & Ketentuan (T&C)
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/privacy-policy"
                                        className="transition-colors hover:text-zinc-950 dark:hover:text-white"
                                    >
                                        Kebijakan Privasi
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="/images/Profile.pdf"
                                        download="Ridhwan_Anang_Maruf_Resume.pdf"
                                        className="transition-colors hover:text-zinc-950 dark:hover:text-white"
                                    >
                                        Curriculum Vitae (PDF)
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contacts / Quick links */}
                        <div className="space-y-2.5">
                            <h5 className="text-[10.5px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                Kontak
                            </h5>
                            <ul className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                <li>
                                    <a
                                        href="mailto:ridhwananang@gmail.com"
                                        className="transition-colors hover:text-zinc-950 dark:hover:text-white"
                                    >
                                        ridhwananang@gmail.com
                                    </a>
                                </li>
                                <li className="text-zinc-500 dark:text-zinc-400">
                                    Tangerang Selatan, Indonesia
                                </li>
                                <li className="pt-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsContactOpen(true)}
                                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 active:scale-98"
                                    >
                                        <Sparkles size={11} />
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
                                className="transition-colors hover:text-zinc-900 dark:hover:text-white"
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

            {/* Integrated Contact Drawer */}
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
