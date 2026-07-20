import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  getMyConversations,
  getMessages,
  sendMessage,
  startConversation,
} from '../../services/chatService';
import { getSocket } from '../../services/socket';
import {
  Phone,
  Video,
  Paperclip,
  Smile,
  Send,
  Search,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  MessageSquare,
  MoreVertical,
  ArrowLeft
} from 'lucide-react';

const timeShort = (dateStr) =>
  new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const dayLabel = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
};

function groupMessagesByDay(messages) {
  const groups = [];
  let lastKey = null;
  messages.forEach((m) => {
    const key = new Date(m.createdAt).toDateString();
    if (key !== lastKey) {
      groups.push({ key, label: dayLabel(m.createdAt), items: [] });
      lastKey = key;
    }
    groups[groups.length - 1].items.push(m);
  });
  return groups;
}

function initials(name = '') {
  return name?.[0]?.toUpperCase() || '?';
}

function Avatar({ name, size = 'w-10 h-10', online, gradient = 'from-blue-600 to-cyan-500' }) {
  return (
    <div className={`relative ${size} flex-shrink-0`}>
      <div
        className={`w-full h-full rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}
      >
        {initials(name)}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#020617]" />
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
    </span>
  );
}

function MessageTicks({ status }) {
  if (status === 'sending') return <Clock size={12} className="text-white/60 animate-pulse" />;
  if (status === 'failed') return <AlertCircle size={12} className="text-red-400" />;
  if (status === 'read') return <CheckCheck size={13} className="text-cyan-300" />;
  return <Check size={13} className="text-white/80" />;
}

export default function Messages() {
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const activeConversation = conversations.find((c) => c._id === activeId);
  const otherParticipant = activeConversation?.participants?.find((p) => p._id !== user?._id);

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      const other = c.participants?.find((p) => p._id !== user?._id);
      return (
        other?.fullName?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q) ||
        c.gig?.title?.toLowerCase().includes(q)
      );
    });
  }, [conversations, search, user]);

  const messageGroups = useMemo(() => groupMessagesByDay(messages), [messages]);

  useEffect(() => {
    const init = async () => {
      try {
        const recipientId = searchParams.get('with');
        const gigId = searchParams.get('gig');

        if (recipientId) {
          const res = await startConversation(recipientId, gigId);
          setActiveId(res.data._id);
        }

        const list = await getMyConversations();
        setConversations(list.data);
        if (!recipientId && list.data.length > 0 && window.innerWidth >= 640) {
          setActiveId(list.data[0]._id);
        }
      } catch (err) {
        toast.error(err.message || 'Could not load conversations');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [searchParams]);

  useEffect(() => {
    if (!activeId) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit('join_chat', activeId);
    setIsOtherTyping(false);

    const loadMessages = async () => {
      try {
        const res = await getMessages(activeId);
        setMessages(res.data);
      } catch (err) {
        toast.error(err.message || 'Could not load messages');
      }
    };
    loadMessages();

    const handleReceive = (msg) => {
      if (msg.conversation !== activeId && msg.conversation?._id !== activeId) return;
      if (msg.sender?._id === user?._id) return;
      setMessages((prev) => [...prev, msg]);
      setIsOtherTyping(false);
    };

    const handleTyping = (payload = {}) => {
      if (payload.conversationId !== activeId) return;
      if (payload.userId === user?._id) return;
      setIsOtherTyping(true);
    };

    const handleStopTyping = (payload = {}) => {
      if (payload.conversationId !== activeId) return;
      setIsOtherTyping(false);
    };

    socket.on('receive_message', handleReceive);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.emit('leave_chat', activeId);
      socket.off('receive_message', handleReceive);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [activeId, user]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      getMyConversations()
        .then((list) => setConversations(list.data))
        .catch(() => {});
    };

    socket.on('conversation_updated', handleUpdate);

    return () => {
      socket.off('conversation_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);

    const socket = getSocket();
    if (!socket || !activeId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', { conversationId: activeId, userId: user?._id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('stop_typing', { conversationId: activeId, userId: user?._id });
    }, 1800);
  };

  const handleSend = useCallback(
    async (e) => {
      e.preventDefault();
      if (!text.trim() || !activeId || sending) return;

      const socket = getSocket();
      if (socket) {
        isTypingRef.current = false;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit('stop_typing', { conversationId: activeId, userId: user?._id });
      }

      setSending(true);
      const body = text;
      setText('');

      const tempId = `temp-${Date.now()}`;
      const optimisticMsg = {
        _id: tempId,
        text: body,
        sender: { _id: user?._id, fullName: user?.fullName },
        createdAt: new Date().toISOString(),
        status: 'sending',
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const res = await sendMessage(activeId, { text: body });
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? { ...res.data, status: 'sent' } : m))
        );
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeId
              ? { ...c, lastMessage: body, lastMessageAt: new Date().toISOString() }
              : c
          )
        );
      } catch (err) {
        toast.error(err.message || 'Message failed to send');
        setMessages((prev) => prev.map((m) => (m._id === tempId ? { ...m, status: 'failed' } : m)));
      } finally {
        setSending(false);
      }
    },
    [text, activeId, sending, user]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 gap-3 text-slate-400 text-sm bg-[#020617] rounded-[32px] border border-white/10">
        <span className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        Loading conversations...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] w-full flex rounded-[32px] border border-white/10 bg-[#020617] overflow-hidden shadow-2xl relative">
      {/* Ambient glow backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      <style>{`
        .chat-scroll::-webkit-scrollbar { width: 6px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 999px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .bubble-in { animation: bubbleIn 0.22s ease-out; }
      `}</style>

      {/* ----------------------------- SIDEBAR ----------------------------- */}
      <div className={`${activeId ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 border-r border-white/10 bg-white/[0.02] backdrop-blur-3xl flex-col`}>
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white mb-3">Messages</h2>
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 focus-within:border-cyan-400/40 transition-colors">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto chat-scroll divide-y divide-white/[0.04]">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <MessageSquare className="mx-auto text-slate-600" size={32} />
              <p className="text-xs text-slate-400">
                {search ? 'No matches found.' : 'No conversations active.'}
              </p>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const other = c.participants?.find((p) => p._id !== user?._id);
              const isActive = activeId === c._id;
              const unread = c.unreadCount || 0;
              return (
                <button
                  key={c._id}
                  onClick={() => setActiveId(c._id)}
                  className={`w-full text-left px-5 py-4 transition-all duration-200 border-l-4 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400/10 to-blue-500/5 border-l-cyan-400'
                      : 'hover:bg-white/[0.03] border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={other?.fullName} online={other?.isOnline} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate font-semibold ${unread > 0 ? 'text-white' : 'text-slate-300'}`}>
                          {other?.fullName || 'Freelancer'}
                        </p>
                        {c.lastMessageAt && (
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {timeShort(c.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-xs text-slate-400 truncate flex-1">
                          {c.lastMessage || 'Start conversation 👋'}
                        </p>
                        {unread > 0 && (
                          <span className="shrink-0 w-5 h-5 rounded-full bg-cyan-400 text-[#020617] text-[10px] font-bold flex items-center justify-center shadow-lg shadow-cyan-400/20">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ----------------------------- CHAT WINDOW ----------------------------- */}
      <div className={`${activeId ? 'flex' : 'hidden sm:flex'} flex-1 flex flex-col bg-[#020617] min-w-0`}>
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 px-6 text-center">
            <div className="w-20 h-20 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-6 shadow-xl">
              💬
            </div>
            <h3 className="text-lg font-bold text-white">Select a Conversation</h3>
            <p className="mt-2 text-xs text-slate-500 max-w-xs">
              Pick a freelancer contact from the left list panel to begin instant updates.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02] backdrop-blur-2xl flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="sm:hidden p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft size={18} />
                </button>
                <Avatar
                  name={otherParticipant?.fullName}
                  size="w-10 h-10"
                  online={otherParticipant?.isOnline}
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-100 text-sm md:text-base truncate">
                    {otherParticipant?.fullName || 'Freelancer'}
                  </h3>
                  <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                    {isOtherTyping ? (
                      <span className="text-cyan-300 flex items-center gap-1">
                        typing <TypingDots />
                      </span>
                    ) : otherParticipant?.isOnline ? (
                      <span className="text-emerald-400 font-semibold">Online</span>
                    ) : (
                      <span className="text-slate-500">Offline</span>
                    )}
                    {activeConversation.gig?.title && (
                      <span className="text-slate-600 truncate">· Re: {activeConversation.gig.title}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-cyan-400/30 text-slate-400 hover:text-cyan-300 transition"
                >
                  <Phone size={16} />
                </button>
                <button
                  type="button"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-cyan-400/30 text-slate-400 hover:text-cyan-300 transition"
                >
                  <Video size={16} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto chat-scroll px-5 py-6 space-y-6 bg-[#020617]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <p className="text-xs">Say hello to get things started 👋</p>
                </div>
              ) : (
                messageGroups.map((group) => (
                  <div key={group.key} className="space-y-4">
                    <div className="flex items-center justify-center my-6">
                      <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/5 px-3 py-1 rounded-full">
                        {group.label}
                      </span>
                    </div>

                    {group.items.map((m) => {
                      const isMine = m.sender?._id === user?._id;
                      return (
                        <div
                          key={m._id}
                          className={`flex bubble-in ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMine && (
                            <div className="mr-2.5 self-end">
                              <Avatar name={otherParticipant?.fullName} size="w-7 h-7" />
                            </div>
                          )}
                          <div
                            className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-md ${
                              isMine
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-br-none'
                                : 'bg-white/5 border border-white/5 text-slate-200 rounded-bl-none'
                            } ${m.status === 'failed' ? 'border-red-500 bg-red-950/20' : ''}`}
                          >
                            <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">{m.text}</p>
                            <div
                              className={`mt-1.5 flex items-center gap-1 text-[9px] ${
                                isMine ? 'text-white/60 justify-end' : 'text-slate-400'
                              }`}
                            >
                              <span>{timeShort(m.createdAt)}</span>
                              {isMine && <MessageTicks status={m.status} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              {isOtherTyping && (
                <div className="flex justify-start bubble-in">
                  <div className="mr-2.5 self-end">
                    <Avatar name={otherParticipant?.fullName} size="w-7 h-7" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-white/5 border border-white/5">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Footer Input Box */}
            <form
              onSubmit={handleSend}
              className="px-5 py-4 border-t border-white/10 bg-white/[0.02] backdrop-blur-2xl shrink-0"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 p-1.5 focus-within:border-cyan-400/40 transition-colors">
                <button
                  type="button"
                  className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-300 transition shrink-0"
                >
                  <Paperclip size={18} />
                </button>
                <input
                  type="text"
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Type your message..."
                  className="flex-1 min-w-0 bg-transparent text-white placeholder:text-slate-500 outline-none px-3 text-sm"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center hover:scale-105 transition shrink-0 shadow-md shadow-blue-900/30"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
