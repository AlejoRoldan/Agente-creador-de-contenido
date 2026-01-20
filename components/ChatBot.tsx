
import React, { useState, useRef, useEffect } from 'react';
import { type Chat, type GenerateContentResponse } from '@google/genai';
import { MessageCircle, X, Send, Bot, User, LoaderCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { type ChatMessage } from '../types';
import { ai } from '../services/geminiService';

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const initializeChat = () => {
        chatRef.current = ai.chats.create({
            model: 'gemini-3-pro-preview',
            config: {
                 systemInstruction: 'You are a helpful AI assistant for the Gemini Course Architect application. You can answer questions about course creation, technology, and learning design.',
            }
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        if (!chatRef.current) {
            initializeChat();
        }

        try {
            if (chatRef.current) {
                const stream = await chatRef.current.sendMessageStream({ message: input });

                let modelResponse = '';
                setMessages(prev => [...prev, { role: 'model', content: '' }]);

                for await (const chunk of stream) {
                    const c = chunk as GenerateContentResponse;
                    const textChunk = c.text;
                    if (textChunk) {
                        modelResponse += textChunk;
                        setMessages(prev => {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1].content = modelResponse;
                            return newMessages;
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-500 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-500 z-50"
                aria-label="Open AI Assistant"
            >
                <MessageCircle size={24} />
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-md h-[70vh] max-h-[600px] bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
                    <header className="flex items-center justify-between p-4 border-b border-gray-700">
                         <div className="flex items-center gap-2">
                             <Bot size={20} className="text-emerald-400" />
                             <h3 className="font-bold text-gray-100">Asistente IA</h3>
                         </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </header>

                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"><Bot size={18} className="text-emerald-400" /></div>}
                                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-lg' : 'bg-gray-700 text-gray-200 rounded-bl-lg'}`}>
                                       <div className="prose prose-invert prose-sm max-w-none text-gray-200 prose-p:my-1 prose-headings:text-gray-100 prose-strong:text-gray-100 prose-code:text-emerald-300 prose-code:bg-gray-900/50 prose-code:p-1 prose-code:rounded-md prose-blockquote:border-l-emerald-500">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                     {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"><User size={18} className="text-gray-400" /></div>}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"><Bot size={18} className="text-emerald-400" /></div>
                                    <div className="max-w-[80%] p-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-lg flex items-center">
                                        <LoaderCircle className="animate-spin text-emerald-400" size={20}/>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
                        <div className="flex items-center gap-2">
                             <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Haz una pregunta..."
                                className="flex-1 bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm"
                                disabled={isLoading}
                            />
                            <button type="submit" disabled={isLoading || !input.trim()} className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatBot;
