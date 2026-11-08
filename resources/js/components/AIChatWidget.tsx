import {
    X,
    Bot,
    User,
    Sparkles,
    SendHorizontal,
    RotateCcw,
    Copy,
    Check,
    MessageSquare,
    CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
    sender: 'user' | 'bot' | 'ridhwan';
    text: string;
    time: string;
}

const CURATED_SUGGESTIONS = [
    {
        label: '🏛️ Arsitektur Finverra (Clean Arch)',
        query: 'Jelaskan arsitektur Clean Architecture & Repository Pattern pada proyek Finverra.',
    },
    {
        label: '⚡ Optimasi Database & Relasi SQL',
        query: 'Bagaimana pendekatan Ridhwan dalam optimasi query MySQL/PostgreSQL, indexing, dan locking?',
    },
    {
        label: '⚛️ Integrasi React 19 & TypeScript',
        query: 'Bagaimana Ridhwan mengintegrasikan React 19, TypeScript, dan Inertia.js untuk antarmuka responsif?',
    },
    {
        label: '📜 Lisensi DBS Camp & Dicoding',
        query: 'Apa saja lisensi dan sertifikasi keahlian yang dimiliki Ridhwan dari DBS Foundation & Dicoding?',
    },
    {
        label: '💼 Ketersediaan Kontrak / Status Kerja',
        query: 'Apakah Ridhwan saat ini tersedia untuk kontrak kerja atau kolaborasi? Bagaimana cara menghubunginya?',
    },
];

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isSendingRef = useRef(false);

    // Initial technical welcome greeting
    const createInitialMessage = (): ChatMessage => ({
        sender: 'bot',
        text: "Halo! Saya adalah **Asisten AI Rekayasa Software Ridhwan Anang Ma'ruf**. ✨\n\nSaya dibekali pemahaman spesifik mengenai arsitektur backend **Laravel 12**, integrasi **React 19 + TypeScript**, optimasi database relasional, serta proyek-proyek unggulan seperti **Finverra**, **MyClassyTask**, dan **SportIn**.\n\nSilakan pilih topik di bawah atau ketik pertanyaan teknis Anda!",
        time: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        }),
    });

    useEffect(() => {
        setMessages([createInitialMessage()]);

        const timer = setTimeout(() => {
            setShowTooltip(true);
        }, 2800);

        return () => clearTimeout(timer);
    }, []);

    // Internal container scroll ONLY — never scrolls outer window/page on Enter
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, isTyping]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setShowTooltip(false);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 250);
        }
    }, [isOpen]);

    // Autocheck reply silently in background if email exists in localStorage when chat is opened
    // NOTE: Does NOT set isTyping = true so user can immediately type and press Enter without lock!
    useEffect(() => {
        if (!isOpen) return;

        let email: string | null = null;
        try {
            email = localStorage.getItem('user_contact_email');
        } catch {
            // Safe guard against restricted localStorage
        }

        if (!email) return;

        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                messages: [{ sender: 'user', text: email }],
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('API Error');
                return res.json();
            })
            .then((data) => {
                if (data.reply) {
                    setMessages((prev) => {
                        if (prev.some((m) => m.sender === 'ridhwan' && m.text === data.reply)) {
                            return prev;
                        }
                        return [
                            ...prev,
                            {
                                sender: 'ridhwan',
                                text: data.reply,
                                time: new Date().toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }),
                            },
                        ];
                    });
                }
            })
            .catch((err) => console.error('Silent background reply check failed:', err));
    }, [isOpen]);

    const handleResetChat = () => {
        setMessages([createInitialMessage()]);
        isSendingRef.current = false;
        setIsTyping(false);
        setChatInput('');
        inputRef.current?.focus();
    };

    const handleCopyMessage = (text: string, index: number) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }
    };

    const handleSendMessage = async (customText?: string) => {
        const textToSend = (customText || chatInput).trim();
        // Strict guard against double-submits, empty text, or concurrent requests
        if (!textToSend || isSendingRef.current || isTyping) return;

        isSendingRef.current = true;
        if (!customText) {
            setChatInput('');
        }
        setShowTooltip(false);

        const newUserMessage: ChatMessage = {
            sender: 'user',
            text: textToSend,
            time: new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    messages: updatedMessages.map((m) => ({
                        sender: m.sender,
                        text: m.text,
                    })),
                }),
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const newMsgs: ChatMessage[] = [];

            if (data.text) {
                newMsgs.push({
                    sender: 'bot',
                    text: data.text,
                    time: new Date().toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                });
            }

            if (data.reply) {
                newMsgs.push({
                    sender: 'ridhwan',
                    text: data.reply,
                    time: new Date().toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                });
            }

            if (newMsgs.length > 0) {
                setMessages((prev) => [...prev, ...newMsgs]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: 'bot',
                        text: 'Saya siap mendiskusikan arsitektur teknis atau proyek Ridhwan. Silakan ajukan pertanyaan lain atau hubungi langsung via **ridhwananang@gmail.com**.',
                        time: new Date().toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                    },
                ]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    sender: 'bot',
                    text: 'Koneksi asisten sedang sibuk. Namun, Anda dapat melihat arsitektur **Laravel 12**, **React 19**, dan **Clean Architecture** pada proyek-proyek Ridhwan di halaman portofolio ini, atau hubungi via **ridhwananang@gmail.com**.',
                    time: new Date().toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                },
            ]);
        } finally {
            isSendingRef.current = false;
            setIsTyping(false);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 60);
        }
    };

    // Render formatted markdown with champagne gold highlights and code chips
    const renderMessageText = (text: string) => {
        const lines = text.split('\n');

        return lines.map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) {
                return <div key={i} className="h-1.5" />;
            }

            const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
            const contentLine = isBullet ? trimmed.replace(/^[-*]\s+/, '') : line;

            // Split by inline code first (`code`), then bold (**text**)
            const parts = contentLine.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

            const renderedContent = parts.map((part, j) => {
                if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
                    return (
                        <code
                            key={j}
                            className="rounded bg-amber-500/10 px-1 py-0.5 font-mono text-[11px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20"
                        >
                            {part.slice(1, -1)}
                        </code>
                    );
                }
                if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                    return (
                        <strong
                            key={j}
                            className="font-bold text-amber-800 dark:text-amber-300"
                        >
                            {part.slice(2, -2)}
                        </strong>
                    );
                }
                return part;
            });

            if (isBullet) {
                return (
                    <li key={i} className="ml-2 flex items-start gap-1.5 text-xs py-0.5">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" />
                        <span className="flex-1 leading-relaxed">{renderedContent}</span>
                    </li>
                );
            }

            return (
                <p key={i} className="mb-1 text-xs leading-relaxed last:mb-0">
                    {renderedContent}
                </p>
            );
        });
    };

    return (
        <div className="fixed right-3 bottom-3 z-50 font-sans sm:right-6 sm:bottom-6">
            {/* Custom Webkit Scrollbar Styling for Chat Box */}
            <style>{`
                .chat-scroll-container::-webkit-scrollbar {
                    width: 4px;
                }
                .chat-scroll-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .chat-scroll-container::-webkit-scrollbar-thumb {
                    background: rgba(245, 158, 11, 0.25);
                    border-radius: 99px;
                }
                .chat-scroll-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(245, 158, 11, 0.5);
                }
                .chips-scroll-container::-webkit-scrollbar {
                    display: none;
                }
                .chips-scroll-container {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes float-avatar {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-7px); }
                }
                .animate-float-avatar {
                    animation: float-avatar 4.5s ease-in-out infinite;
                }
            `}</style>

            {/* Tooltip Popup (Luxury Capsule Preview) */}
            <AnimatePresence>
                {showTooltip && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => {
                            setIsOpen(true);
                            setShowTooltip(false);
                        }}
                        className="absolute right-0 bottom-[148px] mb-2 cursor-pointer select-none rounded-2xl border border-amber-500/30 bg-white/95 px-4 py-2.5 text-xs font-bold whitespace-nowrap text-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:border-blue-400/25 dark:bg-[#0c162f]/95 dark:text-zinc-100 dark:shadow-[0_10px_35px_rgba(0,0,0,0.4)]"
                    >
                        <div className="flex items-center gap-2">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex size-2 rounded-full bg-amber-500"></span>
                            </span>
                            <span className="tracking-tight">Tanya Asisten AI Ridhwan</span>
                            <Sparkles size={11} className="text-amber-500 dark:text-amber-400" />
                        </div>
                        {/* Tooltip triangle */}
                        <div className="absolute right-6 bottom-[-6px] h-3 w-3 rotate-45 border-r border-b border-amber-500/30 bg-white dark:border-blue-400/25 dark:bg-[#0c162f]"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Interactive Mode: Mutually exclusive between Chat Dialog and Avatar FAB (Zero Gaps, Zero Redundant Floating Buttons) */}
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        key="chat-dialog"
                        initial={{
                            opacity: 0,
                            scale: 0.95,
                            y: 20,
                            originX: 0.95,
                            originY: 0.95,
                        }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 28,
                        }}
                        className="relative flex h-[570px] max-h-[calc(100vh-24px)] w-[calc(100vw-24px)] sm:w-[410px] flex-col overflow-hidden rounded-[1.75rem] border border-amber-500/25 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] backdrop-blur-2xl dark:border-blue-400/20 dark:bg-[#080e21] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.65)]"
                    >
                        {/* Top Champagne Gold Specular Hairline */}
                        <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

                        {/* Ambient Deep Blue/Gold Background Glows */}
                        <div className="pointer-events-none absolute -top-16 -right-16 z-0 size-48 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/12"></div>
                        <div className="pointer-events-none absolute -bottom-16 -left-16 z-0 size-48 rounded-full bg-blue-600/10 blur-3xl dark:bg-blue-600/15"></div>

                        {/* Header: Royal Blue Glass Capsule */}
                        <div className="relative z-10 flex items-center justify-between border-b border-zinc-200/80 bg-zinc-50/80 px-5 py-3.5 backdrop-blur-xl dark:border-blue-400/15 dark:bg-[#0c162f]/85">
                            <div className="flex items-center gap-3">
                                {/* Glowing Monogram Avatar */}
                                <div className="relative flex size-9.5 items-center justify-center overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-blue-600/20 shadow-sm dark:border-amber-400/30 dark:bg-[#091024]">
                                    <img
                                        src="/images/ai_avatar_header.webp"
                                        alt="Asisten Ridhwan"
                                        className="h-full w-full object-cover"
                                    />
                                    <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] dark:border-[#080e21]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="text-xs font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                                            Asisten AI Ridhwan
                                        </h4>
                                        <Sparkles
                                            size={11}
                                            className="text-amber-500 fill-amber-500/30 dark:text-amber-400"
                                        />
                                    </div>
                                    <p className="text-[9px] font-mono font-semibold tracking-wider text-amber-700/80 uppercase dark:text-amber-300/80">
                                        Full Stack Engineering Specialist
                                    </p>
                                </div>
                            </div>

                            {/* Header Actions: Reset Chat & Close Button */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleResetChat}
                                    title="Mulai percakapan baru"
                                    className="cursor-pointer flex size-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-200/60 hover:text-amber-600 dark:text-zinc-400 dark:hover:bg-blue-400/10 dark:hover:text-amber-300"
                                    aria-label="Reset chat"
                                >
                                    <RotateCcw size={13} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    title="Tutup percakapan"
                                    className="cursor-pointer flex size-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-blue-400/10 dark:hover:text-zinc-100"
                                    aria-label="Tutup obrolan"
                                >
                                    <X size={15} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages List (Container Scrolled Independently, Zero Window Shift) */}
                        <div
                            ref={messagesContainerRef}
                            className="chat-scroll-container relative z-10 flex-1 space-y-3.5 overflow-y-auto px-4 py-4"
                        >
                            {messages.map((m, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 420,
                                        damping: 30,
                                    }}
                                    key={idx}
                                    className={`group relative flex max-w-[88%] items-end gap-2 ${
                                        m.sender === 'user'
                                            ? 'ml-auto flex-row-reverse'
                                            : 'mr-auto'
                                    }`}
                                >
                                    {/* Sender Icon */}
                                    {m.sender === 'ridhwan' ? (
                                        <div className="size-7 shrink-0 overflow-hidden rounded-lg border border-amber-500/40 bg-[#091024] shadow-xs">
                                            <img
                                                src="/images/me.webp"
                                                alt="Ridhwan Anang"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className={`flex size-7 shrink-0 items-center justify-center rounded-lg border shadow-xs ${
                                                m.sender === 'user'
                                                    ? 'border-blue-400/30 bg-[#0c162f] text-amber-300'
                                                    : 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:border-amber-400/20 dark:text-amber-400'
                                            }`}
                                        >
                                            {m.sender === 'user' ? (
                                                <User size={13} />
                                            ) : (
                                                <Bot size={13} />
                                            )}
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div
                                        className={`relative rounded-2xl border px-3.5 py-2.5 text-xs shadow-xs ${
                                            m.sender === 'ridhwan'
                                                ? 'rounded-bl-none border-amber-500/40 bg-amber-500/10 text-zinc-900 dark:bg-amber-500/12 dark:text-amber-100 shadow-[0_2px_12px_rgba(245,158,11,0.12)]'
                                                : m.sender === 'user'
                                                    ? 'rounded-br-none border-blue-400/30 bg-gradient-to-tr from-[#0a1538] via-[#0f2152] to-[#162d6d] text-white shadow-md'
                                                    : 'rounded-bl-none border-zinc-200/90 bg-white/95 text-zinc-800 dark:border-blue-400/20 dark:bg-[#0c162f]/90 dark:text-zinc-100'
                                        }`}
                                    >
                                        {m.sender === 'ridhwan' && (
                                            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                                <CheckCircle2 size={11} className="text-amber-500" />
                                                <span>Balasan Langsung dari Ridhwan</span>
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            {renderMessageText(m.text)}
                                        </div>

                                        <div className="mt-1 flex items-center justify-between gap-3 text-[8.5px] opacity-60">
                                            {m.sender !== 'user' ? (
                                                <button
                                                    onClick={() => handleCopyMessage(m.text, idx)}
                                                    className="cursor-pointer inline-flex items-center gap-1 font-mono transition-opacity hover:opacity-100"
                                                    title="Salin teks"
                                                >
                                                    {copiedIndex === idx ? (
                                                        <>
                                                            <Check size={9} className="text-emerald-500" />
                                                            <span className="text-emerald-500 font-bold">Tersalin</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={9} />
                                                            <span>Salin</span>
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <span />
                                            )}
                                            <span className="font-mono">{m.time}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mr-auto flex max-w-[85%] items-end gap-2"
                                >
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-600 shadow-xs dark:border-amber-400/20 dark:text-amber-400">
                                        <Bot size={13} />
                                    </div>
                                    <div className="flex items-center justify-center rounded-2xl rounded-bl-none border border-zinc-200/80 bg-white/95 px-3.5 py-2.5 shadow-xs dark:border-blue-400/20 dark:bg-[#0c162f]/90">
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-1.5 animate-bounce rounded-full bg-amber-500"></span>
                                            <span className="size-1.5 animate-bounce rounded-full bg-amber-500 delay-150"></span>
                                            <span className="size-1.5 animate-bounce rounded-full bg-amber-500 delay-300"></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Curated Suggestion Chips (Specific Engineering Topics) */}
                        <div className="relative z-10 border-t border-zinc-200/60 bg-zinc-50/60 px-3 py-2 backdrop-blur-md dark:border-blue-400/10 dark:bg-[#0a1226]/80">
                            <div className="chips-scroll-container flex items-center gap-1.5 overflow-x-auto py-0.5">
                                {CURATED_SUGGESTIONS.map((sug, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(sug.query)}
                                        className="cursor-pointer shrink-0 rounded-full border border-amber-500/25 bg-white/90 px-2.5 py-1 text-[10.5px] font-medium text-zinc-700 shadow-2xs transition-all hover:border-amber-400/50 hover:bg-amber-500/10 hover:text-amber-700 active:scale-95 dark:border-blue-400/20 dark:bg-[#0c162f]/80 dark:text-zinc-300 dark:hover:border-amber-400/40 dark:hover:text-amber-300"
                                    >
                                        <span>{sug.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input Capsule Dock */}
                        <div className="relative z-10 border-t border-zinc-200/80 bg-white p-3 dark:border-blue-400/15 dark:bg-[#080e21]">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="flex items-center gap-2 rounded-xl border border-zinc-200/90 bg-zinc-50/90 p-1.5 transition-all focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20 dark:border-blue-400/20 dark:bg-[#0c162f]/70"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder={isTyping ? "Asisten sedang menjawab..." : "Tanya arsitektur, proyek, atau keahlian..."}
                                    disabled={isTyping}
                                    className="flex-1 bg-transparent px-2.5 py-1 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:outline-none dark:text-zinc-100 dark:placeholder-zinc-500 disabled:opacity-60"
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim() || isTyping}
                                    className="luxury-btn-primary flex size-7.5 cursor-pointer items-center justify-center rounded-lg text-zinc-950 shadow-xs transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label="Kirim pesan"
                                >
                                    <SendHorizontal size={13} strokeWidth={2.5} />
                                </button>
                            </form>

                            <div className="mt-2 flex items-center justify-between text-[8px] font-medium text-zinc-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1 font-mono">
                                    <MessageSquare size={9} className="text-amber-500" />
                                    <span>Gemini 2.5 Flash • Respon Cepat</span>
                                </span>
                                <span className="flex items-center gap-1 font-mono">
                                    <span>Tekan Enter</span>
                                    <span className="rounded border border-zinc-300 bg-zinc-100 px-1 py-0.2 text-[7.5px] dark:border-zinc-700 dark:bg-zinc-800">
                                        ↵
                                    </span>
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* Floating Action Button (Only rendered when Chat Dialog is CLOSED) */
                    <motion.button
                        key="character-trigger"
                        initial={{ opacity: 0, scale: 0.8, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 15 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="animate-float-avatar group relative flex cursor-pointer items-end justify-center border-none bg-transparent p-0 outline-none select-none focus:outline-none"
                        style={{ height: '144px', width: '67px' }}
                        aria-label="Tanya Asisten AI Ridhwan"
                    >
                        {/* Luminous Gold Amber Shadow underneath character's feet */}
                        <span className="absolute bottom-1 left-1/2 -z-10 h-2 w-11 -translate-x-1/2 rounded-full bg-amber-500/20 blur-[3px] transition-transform duration-300 group-hover:scale-125 dark:bg-amber-400/25"></span>

                        <img
                            src="/images/ai_avatar.webp"
                            alt="Karakter AI Ridhwan Anang"
                            className="h-full w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] filter dark:drop-shadow-[0_8px_20px_rgba(245,158,11,0.25)]"
                            draggable="false"
                        />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
