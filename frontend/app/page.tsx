"use client";

import React, { useState, useRef } from "react";
import { Message, MessageRole, MessageType } from "@/types";
import { Header } from "@/components/layout";
import { ChatWindow, ChatInput, ChatWelcome } from "@/components/chat";
import { sendChatMessage } from "@/lib/api";

/**
 * Main application component for WanderWise AI
 * 
 * Simple chat interface for AI-powered travel planning
 */
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  // Store conversation state for multi-turn conversations
  const conversationStateRef = useRef<Record<string, unknown> | null>(null);

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
   * Sends message to backend AI and updates conversation state
   */
  const handleSendMessage = async (content: string) => {
    // Add user message
    addMessage("user", "text", content);
    setIsTyping(true);

    try {
      // Send message to backend API
      const response = await sendChatMessage(content, conversationStateRef.current);
      
      // Update conversation state for next turn
      conversationStateRef.current = response.conversation_state;
      
      // Add assistant response with metadata for plans/itinerary
      addMessage(
        "assistant", 
        "text", 
        response.assistant_message,
        {
          has_travel_plans: response.has_travel_plans,
          has_itinerary: response.has_itinerary,
          travel_plans: response.travel_plans || null,
          itinerary: response.itinerary || null,
        }
      );
      
    } catch (error) {
      // Handle errors gracefully
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to get response from AI. Please try again.";
      
      addMessage(
        "assistant", 
        "text", 
        `Sorry, I encountered an error: ${errorMessage}`
      );
      
      console.error("Chat API error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Handles plan selection from TravelPlansCard
   * Sends the selected plan name back to the backend
   * IMPORTANT: Send the exact plan name (e.g., "balanced-cultural-leisure") 
   * to maintain consistency with backend plan keys
   */
  const handleSelectPlan = async (planName: string) => {
    // Send the exact plan name to maintain consistency with backend plan keys
    await handleSendMessage(`I choose the ${planName} plan`);
  };

  /**
   * Starts a new chat conversation
   */
  const handleNewChat = () => {
    setMessages([]);
    setIsTyping(false);
    conversationStateRef.current = null; // Reset conversation state
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
            onSelectPlan={handleSelectPlan}
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
