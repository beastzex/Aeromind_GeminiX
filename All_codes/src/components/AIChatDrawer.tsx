'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Loader2,
  Globe,
  Zap,
  Clock,
  Compass,
} from 'lucide-react';
import { sendAdvisorChatApi } from '@/services/api';
import { ToolCallCitation } from '@/lib/groqClient';
import { VoiceAssistantPanel } from './VoiceAssistantPanel';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: ToolCallCitation[];
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatDrawer({ isOpen, onClose }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        '👋 Welcome! I am your General Real-Time AI Flight Assistant.\n\nI answer EVERY travel query with live precision: ask me to search direct non-stop flights in any time window (e.g. 9 AM to 10 AM), predict delay chances for any flight, or calculate gate walking ETAs!',
      citations: [
        {
          toolName: 'system_connect',
          source: 'AeroMind Real-Time Flight Engine & OpenSky Network ADS-B',
          timestamp: 'Live Connection',
          data: { status: 'Telemetry Active' },
        },
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await sendAdvisorChatApi(query);
      if (res && res.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ast_${Date.now()}`,
            role: 'assistant',
            content: res.reply,
            citations: res.citations || [],
          },
        ]);
      } else {
        throw new Error('No response');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : null;
      setMessages((prev) => [
        ...prev,
        {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I couldn't reach the flight data engine just now${message ? ` (${message})` : ''}. Please try again in a moment.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleChips = [
    'Show direct non-stop flights between 9 am and 10 am',
    'What are the delay chances for Flight AI302?',
    'Find morning flights DEL to SFO',
    'What is my gate walking time at SFO?',
    'Explain Boeing 777 specs vs A350',
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end font-manrope">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Slide-over Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-xl bg-white dark:bg-neutral-950 text-black dark:text-white border-l border-black/10 dark:border-white/10 shadow-2xl h-full flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-1.5">
                  <span>General Real-Time AI Assistant</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    LIVE DATA
                  </span>
                </h3>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Gemini · Groq Fallback · OpenSky Telemetry
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <VoiceAssistantPanel />
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed overflow-x-auto ${
                    msg.role === 'user'
                      ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white'
                  }`}
                >
                  {/* Message Content formatted with Markdown rendering */}
                  <div className="max-w-none space-y-2 font-manrope [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-sm font-bold mt-3 mb-1.5 first:mt-0">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-sm font-bold mt-3 mb-1.5 first:mt-0">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xs font-bold mt-3 mb-1.5 first:mt-0">{children}</h3>
                        ),
                        p: ({ children }) => (
                          <p className="leading-relaxed mb-2 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold">{children}</strong>
                        ),
                        em: ({ children }) => <em className="italic">{children}</em>,
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 space-y-1 mb-2 last:mb-0">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 space-y-1 mb-2 last:mb-0">{children}</ol>
                        ),
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-black/20 dark:border-white/20 pl-3 my-2 text-neutral-600 dark:text-neutral-400">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[11px]">
                            {children}
                          </code>
                        ),
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2 hover:text-black dark:hover:text-white"
                          >
                            {children}
                          </a>
                        ),
                        hr: () => (
                          <hr className="my-2 border-black/10 dark:border-white/10" />
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-2 rounded-lg border border-black/10 dark:border-white/10">
                            <table className="w-full text-left text-[11px] border-collapse min-w-[500px]">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-black/5 dark:bg-white/10 font-bold border-b border-black/10 dark:border-white/10">
                            {children}
                          </thead>
                        ),
                        tr: ({ children }) => (
                          <tr className="border-b border-black/5 dark:border-white/5 last:border-b-0">
                            {children}
                          </tr>
                        ),
                        th: ({ children }) => <th className="p-2 whitespace-nowrap">{children}</th>,
                        td: ({ children }) => <td className="p-2 whitespace-nowrap">{children}</td>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Citations Footer */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/15 space-y-1 font-mono text-[10px]">
                      {msg.citations.map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                          <Globe className="w-3 h-3 text-emerald-500" />
                          <span>SOURCE: {c.source} ({c.timestamp})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-neutral-500 italic p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-black/5 dark:border-white/5">
                <Loader2 className="w-4 h-4 animate-spin text-black dark:text-white" />
                <span>Querying OpenSky radar vectors & calculating delay probabilities…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2.5 border-t border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {sampleChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="flex-shrink-0 text-[11px] px-3.5 py-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 hover:border-black dark:hover:border-white text-neutral-800 dark:text-neutral-200 transition-all whitespace-nowrap shadow-sm hover:scale-105"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-3.5 border-t border-black/10 dark:border-white/10 bg-white dark:bg-neutral-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything (e.g. show direct non-stop flights 9 am - 10 am, delay predictions)..."
                className="flex-1 px-4 py-3 rounded-full border border-black/10 dark:border-white/15 bg-neutral-50 dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white font-manrope shadow-inner"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center shadow-md"
              >
                <Send className="w-4 h-4 stroke-[2]" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
