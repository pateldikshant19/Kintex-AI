import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, Sparkles, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AIChat = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: `Hello ${user?.name || 'Athlete'}! I am Kinetix AI. How can I help you optimize your ${user?.sport || 'performance'} today?` }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulated AI Logic based on Role/Sport
        setTimeout(() => {
            let aiResponse = "";
            const lowerInput = input.toLowerCase();

            if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                aiResponse = "Greetings! Ready to analyze some metrics?";
            } else if (lowerInput.includes('performance') || lowerInput.includes('stats')) {
                aiResponse = user?.role === 'manager'
                    ? "Team performance is up 12% this week. I recommend focusing on recovery for the mid-fielders."
                    : "Your recent pace is consistent, but your heart rate recovery during interval training could be faster. I've logged some hydration tips for you.";
            } else if (lowerInput.includes('injury')) {
                aiResponse = "I've detected slight fatigue in your left hamstring data. I suggest a 20-minute mobility session before your next practice.";
            } else if (lowerInput.includes('strategy')) {
                aiResponse = "Based on the upcoming opponent's data, a defensive high-line might be risky. Let's look at the counter-attack probability.";
            } else {
                aiResponse = "That's an interesting perspective. I'll correlate that with our live data streams and update your dashboard accordingly.";
            }

            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
            setIsTyping(false);
        }, 1500);
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] h-[500px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Kinetix Intelligence</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-[10px] text-white/80 uppercase font-bold tracking-widest">Active System</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-white" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-slate-800/50 border-t border-white/5">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask Kinetix anything..."
                                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-orange-500 rounded-lg text-white hover:bg-orange-600 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative p-4 rounded-2xl shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-800 text-white' : 'bg-gradient-to-br from-orange-500 to-rose-600 text-white'
                    }`}
            >
                {isOpen ? <X size={24} /> : (
                    <>
                        <Bot size={24} className="group-hover:rotate-12 transition-transform" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-slate-900 animate-bounce" />
                    </>
                )}
            </button>
        </div>
    );
};

export default AIChat;
