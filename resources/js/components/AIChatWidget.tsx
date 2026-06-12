import {
    X,
    Bot,
    User,
    Sparkles,
    SendHorizontal,
    MessageSquare,
    ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
    sender: 'user' | 'bot' | 'ridhwan';
    text: string;
    time: string;
}

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initialize with a premium, engaging welcome message
    useEffect(() => {
        setMessages([
            {
                sender: 'bot',
                text: 'Halo! Saya adalah **Asisten Virtual Ridhwan**. ✨\n\nAda yang bisa saya bantu hari ini? Anda bisa bertanya mengenai keahlian Laravel/React saya, proyek unggulan, atau mendiskusikan peluang kolaborasi.',
                time: new Date().toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            },
        ]);

        // Show tooltip after a short delay
        const timer = setTimeout(() => {
            setShowTooltip(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Autocheck reply in background if email exists in localStorage when chat is opened
    useEffect(() => {
        if (!isOpen) return;

        const email = localStorage.getItem('user_contact_email');
        if (!email) return;

        // Perform background check for Ridhwan's replies
        setIsTyping(true);
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
                        // Avoid adding duplicate replies in the same session
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
            .catch((err) => console.error('Silent background reply check failed:', err))
            .finally(() => setIsTyping(false));
    }, [isOpen]);

    const handleSendMessage = async (customText?: string) => {
        const textToSend = (customText || chatInput).trim();

        if (!textToSend) {
return;
}

        if (!customText) {
            setChatInput('');
        }

        // Hide tooltip once user interacts
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

            if (!response.ok) {
                throw new Error('API Error');
            }

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
                        text: 'Maaf, saya sedang kesulitan memproses respon saat ini.',
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
                    text: 'Koneksi ke asisten sedang terganggu. Ridhwan sangat ahli dalam Laravel dan React! Anda juga dapat menghubunginya langsung lewat email: ridhwananang@gmail.com.',
                    time: new Date().toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    // Helper to render markdown-like bold text and bulleted lists in messages
    const renderMessageText = (text: string) => {
        const lines = text.split('\n');

        return lines.map((line, i) => {
            let renderedLine = line;

            // Check if it's a list item
            const isBullet =
                line.trim().startsWith('- ') || line.trim().startsWith('* ');

            if (isBullet) {
                renderedLine = line.replace(/^[\s-*]+/, ''); // remove bullet symbol
            }

            // Parse bold text
            const parts = renderedLine.split(/(\*\*.*?\*\*)/g);
            const content = parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <strong
                            key={j}
                            className="font-extrabold text-slate-900 dark:text-white"
                        >
                            {part.slice(2, -2)}
                        </strong>
                    );
                }

                return part;
            });

            if (isBullet) {
                return (
                    <li
                        key={i}
                        className="dark:text-slate-350 ml-4 list-disc pl-1 text-slate-700"
                    >
                        {content}
                    </li>
                );
            }

            return (
                <p key={i} className="mb-1.5 last:mb-0">
                    {content}
                </p>
            );
        });
    };

    return (
        <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end font-sans sm:right-6 sm:bottom-6">
            {/* Custom Webkit Scrollbar Styling */}
            <style>{`
                .chat-scroll-container::-webkit-scrollbar {
                    width: 4px;
                }
                .chat-scroll-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .chat-scroll-container::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.2);
                    border-radius: 99px;
                }
                .chat-scroll-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.4);
                }
                @keyframes float-avatar {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-6px); }
                }
                .animate-float-avatar {
                    animation: float-avatar 4s ease-in-out infinite;
                }
            `}</style>

            {/* Tooltip Popup */}
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
                        className="absolute right-0 bottom-[152px] mb-2.5 cursor-pointer rounded-2xl border border-violet-100 bg-white/95 px-4 py-3 text-xs font-bold whitespace-nowrap text-slate-700 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95 dark:text-slate-200"
                    >
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 animate-ping rounded-full bg-violet-600"></span>
                            Tanya Asisten Ridhwan
                        </div>
                        {/* Tooltip triangle */}
                        <div className="absolute right-6 bottom-[-6px] h-3 w-3 rotate-45 border-r border-b border-violet-100 bg-white dark:border-slate-800 dark:bg-slate-950"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Dialog Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.9,
                            y: 40,
                            originX: 0.95,
                            originY: 0.95,
                        }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 26,
                        }}
                        className="shadow-3xl relative mb-4.5 flex h-[560px] max-h-[78vh] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2.2rem] border border-slate-200/60 bg-white/95 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/95"
                    >
                        {/* Premium Glowing Background Mesh */}
                        <div className="pointer-events-none absolute -top-20 -right-20 z-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/15"></div>
                        <div className="pointer-events-none absolute -bottom-20 -left-20 z-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10"></div>

                        {/* Premium Header */}
                        <div className="relative z-10 flex items-center justify-between border-b border-slate-100/60 bg-white/40 px-6 py-4.5 backdrop-blur-md dark:border-slate-900/60 dark:bg-slate-950/40">
                            <div className="flex items-center gap-3">
                                {/* Glowing Avatar */}
                                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-violet-100/55 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
                                    <img
                                        src="/images/ai_avatar_header.webp"
                                        alt="Ridhwan Character"
                                        className="h-full w-full object-cover"
                                    />
                                    <span className="absolute -right-0.5 -bottom-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950">
                                        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white opacity-75"></span>
                                    </span>
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-1 text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                                        Asisten Virtual
                                        <Sparkles
                                            size={12}
                                            className="fill-violet-500/30 text-violet-500"
                                        />
                                    </h4>
                                    <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                        Online • Powered by Gemini
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="border-slate-150/40 rounded-full border bg-slate-50/50 p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-white"
                                aria-label="Tutup obrolan"
                            >
                                <ChevronDown size={14} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Chat Messages List */}
                        <div className="chat-scroll-container relative z-10 flex-1 space-y-4 overflow-y-auto px-5 py-5">
                            {messages.map((m, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 30,
                                    }}
                                    key={idx}
                                    className={`flex max-w-[85%] items-end gap-2.5 ${
                                        m.sender === 'user'
                                            ? 'ml-auto flex-row-reverse'
                                            : 'mr-auto'
                                    }`}
                                >
                                    {/* Icon */}
                                    {m.sender === 'ridhwan' ? (
                                        <div className="h-7.5 w-7.5 shrink-0 overflow-hidden rounded-xl border border-violet-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                            <img
                                                src="/images/me.webp"
                                                alt="Ridhwan Anang"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                                                m.sender === 'user'
                                                    ? 'dark:text-slate-350 border-slate-200/50 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900'
                                                    : 'border-violet-100/50 bg-violet-50/60 text-violet-600 dark:border-violet-900/30 dark:bg-violet-950/20 dark:text-violet-400'
                                            }`}
                                        >
                                            {m.sender === 'user' ? (
                                                <User size={13} />
                                            ) : (
                                                <Bot size={13} />
                                            )}
                                        </div>
                                    )}
                                    {/* Bubble */}
                                    <div
                                        className={`rounded-2xl border px-4 py-2.5 text-xs leading-relaxed ${
                                            m.sender === 'ridhwan'
                                                ? 'rounded-bl-none border-violet-200/60 bg-violet-50/45 text-slate-800 shadow-sm dark:border-violet-900/40 dark:bg-violet-950/25 dark:text-slate-100'
                                                : m.sender === 'user'
                                                    ? 'via-slate-800 dark:from-violet-600 dark:to-indigo-600 rounded-br-none border-slate-950 bg-gradient-to-tr from-slate-900 to-slate-900 text-white shadow-md shadow-slate-950/5 dark:border-indigo-600 dark:via-indigo-600 dark:shadow-indigo-500/10'
                                                    : 'rounded-bl-none border-slate-100/40 bg-slate-50/70 text-slate-800 shadow-sm dark:border-slate-900/40 dark:bg-slate-900/55 dark:text-slate-100'
                                        }`}
                                    >
                                        {m.sender === 'ridhwan' && (
                                            <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 animate-fade-in">
                                                <span className="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
                                                Ridhwan Anang • Developer
                                            </div>
                                        )}
                                        <div className="prose prose-sm dark:prose-invert whitespace-pre-line">
                                            {renderMessageText(m.text)}
                                        </div>
                                        <span className="mt-1 block text-right text-[8px] font-semibold opacity-40">
                                            {m.time}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="mr-auto flex max-w-[85%] items-end gap-2.5">
                                    <div className="dark:bg-violet-950/20 flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl border border-violet-100/50 bg-violet-50/60 text-violet-600 shadow-sm dark:border-violet-900/30 dark:text-violet-400">
                                        <Bot size={13} />
                                    </div>
                                    <div className="flex items-center justify-center rounded-2xl rounded-bl-none border border-slate-100/50 bg-slate-50/70 px-4 py-3 shadow-sm dark:border-slate-900/40 dark:bg-slate-900/55">
                                        <div className="flex gap-1.5">
                                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500/70 dark:bg-violet-400"></span>
                                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500/70 delay-150 dark:bg-violet-400"></span>
                                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500/70 delay-300 dark:bg-violet-400"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Footer Input Box Container */}
                        <div className="relative z-10 border-t border-slate-100/60 bg-white p-4.5 dark:border-slate-900/60 dark:bg-slate-950">
                            <div className="border-slate-200/40 dark:border-slate-800 flex items-center gap-2 rounded-2xl border bg-slate-50/60 p-1 dark:bg-slate-900/50">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) =>
                                        setChatInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Tanyakan keahlian Ridhwan..."
                                    className="dark:text-slate-100 flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:outline-none dark:placeholder-slate-500"
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    className="shadow-violet-600/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border-none bg-violet-600 text-white shadow-md transition-all hover:scale-105 hover:bg-violet-700 active:scale-95"
                                >
                                    <SendHorizontal
                                        size={14}
                                        strokeWidth={2.5}
                                    />
                                </button>
                            </div>
                            <div className="mt-2.5 flex items-center justify-between text-[8px] font-bold text-slate-400 dark:text-slate-500">
                                <span className="flex items-center gap-1">
                                    <MessageSquare size={10} />
                                    Respons instan dari Asisten AI
                                </span>
                                <span className="flex items-center gap-1">
                                    Tekan Enter
                                    <span className="dark:bg-slate-800 flex h-3 w-4 items-center justify-center rounded border border-slate-200 bg-slate-100 text-[8px] dark:border-slate-800">
                                        ↵
                                    </span>
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button (FAB) / Interactive Character Trigger */}
            <AnimatePresence mode="wait">
                {!isOpen ? (
                    <motion.button
                        key="character-trigger"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="animate-float-avatar group relative right-2 mb-2 flex cursor-pointer items-end justify-center border-none bg-transparent p-0 outline-none select-none focus:outline-none"
                        style={{ height: '144px', width: '67px' }}
                        aria-label="Tanya Asisten AI"
                    >
                        {/* A very subtle ambient shadow under the character's feet */}
                        <span className="absolute bottom-1 left-1/2 -z-10 h-1.5 w-10 -translate-x-1/2 rounded-full bg-black/10 blur-[2px] transition-transform duration-300 group-hover:scale-110 dark:bg-black/25"></span>

                        <img
                            src="/images/ai_avatar.webp"
                            alt="Ridhwan Character Assistant"
                            className="h-full w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] filter dark:drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
                            draggable="false"
                        />

                        {/* Green online badge near the character's head/shoulder */}
                        {/* <span className="absolute top-2 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950 shadow-md">
                            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white opacity-75"></span>
                        </span> */}
                    </motion.button>
                ) : (
                    <motion.button
                        key="close-trigger"
                        initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setIsOpen(false)}
                        className="mr-2 mb-2 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-lg transition-all hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        aria-label="Tutup obrolan"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
