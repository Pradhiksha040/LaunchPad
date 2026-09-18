'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  MessageSquare,
  HelpCircle,
  AlertCircle,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { chatService, ChatMessage, ChatConversation } from '@/services/chatService';

interface SuggestedPrompt {
  label: string;
  query: string;
  category: string;
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { label: 'Create Application', query: 'How do I create a new application in LaunchPad?', category: 'App Builder' },
  { label: 'Add Modules', query: 'How do I add modules and functionality to my app?', category: 'App Builder' },
  { label: 'Integration Hub', query: 'What is Integration Hub and how do connectors work?', category: 'Integrations' },
  { label: 'Connect REST API', query: 'How do I connect an external REST API backend?', category: 'Integrations' },
  { label: 'Manage Roles', query: 'How do I assign SUPER_ADMIN or DEVELOPER roles?', category: 'RBAC Security' },
  { label: 'Marketplace Licensing', query: 'How do marketplace licenses and monetization work?', category: 'Marketplace' },
  { label: 'Troubleshoot CORS', query: 'Why is my integration failing with network error status 0?', category: 'Support' },
  { label: 'V1 Architecture', query: 'Explain the LaunchPad V1 architecture stack', category: 'Architecture' },
];

export default function AssistantPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    const list = await chatService.getConversations();
    setConversations(list);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setError(null);
    const conv = await chatService.getConversationById(convId);
    if (conv && conv.messages) {
      setMessages(conv.messages);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(undefined);
    setMessages([]);
    setError(null);
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    await chatService.deleteConversation(convId);
    if (activeConversationId === convId) {
      handleNewChat();
    }
    loadConversations();
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setInputMessage('');
    setError(null);
    setIsLoading(true);

    const tempUserMsg: ChatMessage = {
      id: `user-temp-${Date.now()}`,
      conversationId: activeConversationId || 'temp',
      role: 'user',
      content: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await chatService.sendMessage({
        message: query,
        conversationId: activeConversationId,
      });

      setActiveConversationId(res.conversationId);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.userMessage,
        res.assistantMessage,
      ]);
      loadConversations();
    } catch (err: any) {
      setError(err.message || 'LaunchPad Assistant error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col md:flex-row bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Sidebar - Conversation History */}
      <div className="w-full md:w-80 bg-slate-950/80 border-r border-slate-800/80 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">LaunchPad Assistant</h2>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online & Active
                </span>
              </div>
            </div>

            <button
              onClick={handleNewChat}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all flex items-center gap-1 text-xs font-semibold"
              title="Start New Chat"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No conversations found. Start a new chat!
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-200'
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="truncate font-medium">{conv.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    title="Delete chat"
                    className="p-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Tenant Isolated
          </span>
          <span>LaunchPad OS V1</span>
        </div>
      </div>

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
        {/* Workspace Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700/60">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100">
                {activeConversationId ? 'Active Conversation' : 'New Assistant Workspace'}
              </h1>
              <p className="text-xs text-slate-400">
                Ask questions about platform features, applications, integrations, or troubleshooting
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm scrollbar-thin scrollbar-thumb-slate-800">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center max-w-2xl mx-auto py-8">
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4 shadow-xl">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">How can LaunchPad Assistant help you today?</h3>
              <p className="text-xs text-slate-400 mb-8 leading-relaxed">
                LaunchPad Assistant is powered by an authoritative platform knowledge engine and modular AI providers. Select a suggested topic below or type your query.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt.query)}
                    className="p-3.5 bg-slate-800/50 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 rounded-xl transition-all group"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 block mb-1">
                      {prompt.category}
                    </span>
                    <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-200 transition-colors">
                      {prompt.query}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-indigo-600 text-white shadow-md'
                  }`}
                >
                  {msg.role === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-lg'
                      : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl w-fit">
              <Bot className="w-4 h-4 animate-bounce" />
              <span>LaunchPad Assistant is analyzing platform knowledge...</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask LaunchPad Assistant anything..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-indigo-500 text-slate-100 placeholder-slate-500 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 text-xs sm:text-sm"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
