"use client";

import React, { useState } from "react";
import { Message, MessageRole, MessageType } from "@/types";
import { Header } from "@/components/layout";
import { ChatWindow, ChatInput, ChatWelcome } from "@/components/chat";

/**
 * Main application component for WanderWise AI
 * 
 * Simple chat interface for AI-powered travel planning
 */
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  /**
   * Generates unique message ID
   */
  const generateMessageId = (): string => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Adds a new message to the chat
   */
  const addMessage = (
    role: MessageRole,
    type: MessageType,
    content: string,
    metadata?: Message["metadata"]
  ) => {
    const newMessage: Message = {
      id: generateMessageId(),
      role,
      type,
      content,
      timestamp: new Date(),
      metadata,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  /**
   * Handles user message submission
   * TODO: Replace with actual backend API call
   */
  const handleSendMessage = async (content: string) => {
    // Add user message
    addMessage("user", "text", content);
    setIsTyping(true);

    // TODO: Replace with actual API call to backend
    // Example WebSocket connection:
    // const ws = new WebSocket('ws://localhost:8000/api/chat');
    // ws.send(JSON.stringify({ message: content }));
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data.type === 'chunk') {
    //     // Update streaming message
    //   } else if (data.type === 'done') {
    //     setIsTyping(false);
    //   }
    // };

    // Mock response for now
    await new Promise((r) => setTimeout(r, 1500));
    
    const mockResponse = `I'll help you plan that trip! Here's what I can do:

**Research & Analysis**
- Check weather patterns for your dates
- Find the best places to visit
- Compare accommodation options

**Budget Planning**
- Break down costs by category
- Find the best deals
- Optimize your spending

**Itinerary Creation**
- Day-by-day schedule
- Travel logistics
- Local tips and insights

Would you like me to start planning this trip for you?`;

    addMessage("assistant", "text", mockResponse);
    setIsTyping(false);
  };

  /**
   * Starts a new chat conversation
   */
  const handleNewChat = () => {
    setMessages([]);
    setIsTyping(false);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="h-screen flex flex-col bg-[#FDFCFB] text-slate-900 font-sans selection:bg-stone-200">
      <Header 
        isAgentActive={isTyping}
        onNewChat={messages.length > 0 ? handleNewChat : undefined}
      />

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {showWelcome ? (
          <ChatWelcome />
        ) : (
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
          />
        )}
        
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isTyping}
          placeholder="Describe your dream trip..."
        />
      </main>
    </div>
  );
}
