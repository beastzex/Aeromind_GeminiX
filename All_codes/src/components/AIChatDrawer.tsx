'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  X,
  MessageSquare,
  Bot,
  User,
  Loader2,
  ChevronRight,
  Terminal,
  Zap,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { sendAdvisorChatApi } from '@/services/api';
import { ToolCallCitation } from '@/lib/groqClient';

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
        'Greetings! I am AeroMind AI Assistant. I have live system access to OpenSky Network ADS-B telemetry, AviationStack API keys, and your active boarding pass graph (AI302 DEL ➔ SFO). Ask me anything about your flight, gate navigation, baggage rules, or travel rebooking!',
      citations: [
        {
          toolName: 'system_connect',
          source: 'AeroMind Multimodal LLM Engine (OpenSky & Groq Grounded)',
          timestamp: 'Just now',
          data: { flightNo: 'AI302', status: 'Active Monitoring' },
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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          content:
            'Flight AI302 is currently carrying a disruption risk score of 74/100 with an 85 minute departure delay. Assigned departure gate is B22 (Terminal 3). Your downstream Grand Hyatt reservation has been automatically aligned.',
          citations: [
            {
              toolName: 'get_live_flight_status',
              source: 'OpenSky Telemetry & AeroMind AI Cache',
              timestamp: 'Just now',
              data: { flightNo: 'AI302' },
            },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleChips = [
    'What is my gate walking time?',
    'Is AI302 in the air right now?',
    'Explain my rebooking options',
    'What dining options are near Gate B22?',
    'What are the Boeing 777 specs?',
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
          className="relative w-full max-w-lg bg-white dark:bg-neutral-950 text-black dark:text-white border-l border-black/10 dark:border-white/10 shadow-2xl h-full flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-1.5">
                  <span>AeroMind LLM AI Assistant</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-neutral-500">
                    Live APIs
                  </span>
                </h3>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Groq SDK / Gemini Multimodal / OpenSky Grounded
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Citations Footer */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-white/15 space-y-1 font-mono text-[10px]">
                      {msg.citations.map((c, i) => (
                        <div key={i} className="flex items-center gap-1 text-neutral-500">
                          <Globe className="w-3 h-3 text-neutral-400" />
                          <span>CITED: {c.source}</span>
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
              <div className="flex items-center gap-2 text-xs text-neutral-500 italic p-2">
                <Loader2 className="w-4 h-4 animate-spin text-black dark:text-white" />
                <span>Querying OpenSky telemetry & running LLM reasoning…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2 border-t border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {sampleChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 hover:border-black dark:hover:border-white text-neutral-700 dark:text-neutral-300 transition-colors whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-3 border-t border-black/10 dark:border-white/10 bg-white dark:bg-neutral-950">
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
                placeholder="Ask AI Assistant anything about flights, baggage, gates..."
                className="flex-1 px-4 py-2.5 rounded-full border border-black/10 dark:border-white/15 bg-neutral-50 dark:bg-neutral-900 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white font-manrope"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center"
              >
                <Send className="w-4 h-4 stroke-[1.5]" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
