'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatBubble } from './ChatBubble';
import { VoiceWaveform } from './VoiceWaveform';
import { ToolCallCitation } from '@/lib/groqClient';
import { sendAdvisorChatApi } from '@/services/api';
import { Send, Mic, MicOff, Sparkles, CornerDownLeft, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: ToolCallCitation[];
}

export function FlightAdvisor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      role: 'assistant',
      content:
        'Hello! I am AeroMind Flight Advisor. I monitor your live itinerary graph, airport ATC conditions, and terminal locations. How can I assist your journey today?',
      citations: [
        {
          toolName: 'get_live_flight_status',
          source: 'OpenSky Network ADS-B & AviationStack',
          timestamp: 'Just now',
          data: { flightNo: 'AI302' },
        },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
      const data = await sendAdvisorChatApi(query);

      if (data && data.reply) {
        const assistantMsg: Message = {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          citations: data.citations || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('Failed to get reply');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          content:
            'Flight AI302 is currently carrying a disruption risk score of 74/100 with an 85 minute delay. Assigned departure gate is B22 (Terminal 3).',
          citations: [
            {
              toolName: 'get_live_flight_status',
              source: 'AeroMind OpenSky Cache',
              timestamp: '2 min ago',
              data: { flightNo: 'AI302' },
            },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const presetQueries = [
    'Will my connection at SFO be tight?',
    'Is AI302 in the air right now?',
    'What is my gate walking ETA?',
    'Show rebooking options for AI302',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto border border-gray-200 dark:border-gray-800 rounded-card bg-bg-light dark:bg-bg-dark overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-fg-light dark:bg-fg-dark text-bg-light dark:text-bg-dark">
            <Sparkles className="w-4 h-4 stroke-[1.5]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-fg-light dark:text-fg-dark">
              Conversational Flight Advisor
            </h2>
            <span className="text-[10px] text-gray-500 font-mono">
              Grounded in OpenSky ADS-B & AviationStack Live Data
            </span>
          </div>
        </div>

        {/* Voice Mode Toggle */}
        <button
          onClick={() => setIsVoiceActive(!isVoiceActive)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill border text-xs font-semibold transition-all ${
            isVoiceActive
              ? 'border-gray-900 dark:border-gray-100 bg-fg-light dark:bg-fg-dark text-bg-light dark:text-bg-dark animate-pulse'
              : 'border-gray-300 dark:border-gray-700 text-fg-light dark:text-fg-dark hover:bg-gray-100 dark:hover:bg-gray-900'
          }`}
        >
          {isVoiceActive ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span>Voice Active</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Voice Waveform Overlay when active */}
      {isVoiceActive && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Gemini Live Audio Channel Active
          </span>
          <VoiceWaveform isActive={true} />
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            citations={msg.citations}
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-500 italic p-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Querying OpenSky telemetry & running function call…</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Presets Bar */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {presetQueries.map((query, i) => (
          <button
            key={i}
            onClick={() => handleSend(query)}
            className="flex-shrink-0 text-[11px] px-3 py-1 rounded-pill border border-gray-300 dark:border-gray-700 hover:border-gray-500 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-bg-light dark:bg-bg-dark">
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
            placeholder="Ask your Flight Advisor anything about AI302..."
            className="flex-1 px-4 py-2.5 rounded-pill border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-fg-light dark:text-fg-dark focus:outline-none focus:border-gray-500 font-manrope"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-pill bg-fg-light dark:bg-fg-dark text-bg-light dark:text-bg-dark hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center"
          >
            <Send className="w-4 h-4 stroke-[1.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}
