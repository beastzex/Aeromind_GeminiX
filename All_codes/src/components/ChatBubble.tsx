'use client';

import { motion } from 'framer-motion';
import { ToolCallCitation } from '@/lib/groqClient';
import { Sparkles, User, Database } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  citations?: ToolCallCitation[];
}

export function ChatBubble({ role, content, timestamp, citations = [] }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}
    >
      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium px-1">
        {isUser ? (
          <>
            <span>You</span>
            <User className="w-3 h-3 stroke-[1.5]" />
          </>
        ) : (
          <>
            <Sparkles className="w-3 h-3 stroke-[1.5]" />
            <span>AeroMind Agent</span>
          </>
        )}
      </div>

      <div
        className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-card text-xs leading-relaxed ${
          isUser
            ? 'bg-fg-light dark:bg-fg-dark text-bg-light dark:text-bg-dark font-medium rounded-tr-none'
            : 'bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-fg-light dark:text-fg-dark rounded-tl-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>

        {/* Inline Grounded Data Source Citations */}
        {!isUser && citations.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-gray-300 dark:border-gray-800 flex flex-col gap-1">
            {citations.map((cite, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 font-mono"
              >
                <Database className="w-3 h-3 flex-shrink-0" />
                <span>
                  via {cite.source} · {cite.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
