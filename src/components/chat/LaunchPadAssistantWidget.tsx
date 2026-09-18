'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  Sparkles,
  X,
  Send,
  RotateCcw,
  Copy,
  Check,
  Maximize2,
  Trash2,
  HelpCircle,
  AlertCircle,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { chatService, ChatMessage } from '@/services/chatService';

interface SuggestedPrompt {
  label: string;
  query: string;
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { label: 'Create App', query: 'How do I create an application?' },
  { label: 'Add Modules', query: 'How do I add modules to my application?' },
  { label: 'Integration Hub', query: 'What is Integration Hub and how do connectors work?' },
  { label: 'Connect Backend', query: 'How do I connect an existing backend system?' },
  { label: 'Roles & Access', query: 'How do I configure roles and permissions?' },
  { label: 'Publish App', query: 'How do I publish an application?' },
  { label: 'Explain Dashboard', query: 'Explain this dashboard overview' },
  { label: 'Troubleshoot Failures', query: 'Why is my integration failing?' },
];

export function LaunchPadAssistantWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setInputMessage('');
    setError(null);
    setIsLoading(true);

    const tempUserMsg: ChatMessage = {
      id: `user-temp-${Date.now()}`,
      conversationId: conversationId || 'temp',
      role: 'user',
      content: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await chatService.sendMessage({
        message: query,
        conversationId,
        context: {
          currentRoute: pathname,
        },
      });

      setConversationId(res.conversationId);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.userMessage,
        res.assistantMessage,
      ]);
    } catch (err: any) {
      setError(err.message || 'Assistant is temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearConversation = () => {
    setMessages([]);
    setConversationId(undefined);
    setError(null);
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-full shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Open LaunchPad Assistant"
          >
            <div className="relative">
              <Bot className="w-5 h-5 transition-transform group-hover:rotate-12" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-sm font-semibold tracking-wide">LaunchPad Assistant</span>
            <Sparkles className="w-4 h-4 opacity-80 text-amber-300 animate-pulse" />
          </button>
        )}
      </div>

      {/* Floating Expandable Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[92vw] h-[600px] max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-950/80 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-100">LaunchPad Assistant</h3>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                    AI V1
                  </span>
                </div>
                <p className="text-xs text-slate-400">How can I help you today?</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearConversation}
                title="Clear conversation"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <Link
                href="/assistant"
                title="Expand full screen"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin scrollbar-thumb-slate-800">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-4">
                <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1">Welcome to LaunchPad Assistant</h4>
                <p className="text-xs text-slate-400 mb-4 max-w-[280px]">
                  Ask questions about application building, integration hub connectors, roles, or platform features.
                </p>

                <div className="w-full text-left">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-indigo-400" /> Suggested Prompts
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {SUGGESTED_PROMPTS.slice(0, 5).map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt.query)}
                        className="flex items-center justify-between p-2.5 text-xs text-slate-300 bg-slate-800/50 hover:bg-indigo-600/20 hover:text-indigo-200 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-left transition-all group"
                      >
                        <span>{prompt.query}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-500/10'
                        : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-400 border-t border-slate-700/40 pt-1.5">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            title="Copy text"
                            className="p-1 hover:text-slate-200 transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={handleRegenerate}
                            title="Regenerate"
                            className="p-1 hover:text-slate-200 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl w-fit">
                <Bot className="w-4 h-4 animate-bounce" />
                <span>LaunchPad Assistant is thinking...</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{error}</p>
                  <button
                    onClick={handleRegenerate}
                    className="mt-1.5 font-semibold text-red-300 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Try Again
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Strip */}
          {messages.length > 0 && (
            <div className="px-3 py-1.5 bg-slate-950/40 border-t border-slate-800/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt.query)}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800/60 hover:bg-indigo-600/30 hover:text-indigo-200 border border-slate-700/50 rounded-full whitespace-nowrap transition-colors"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask LaunchPad Assistant..."
                disabled={isLoading}
                className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
