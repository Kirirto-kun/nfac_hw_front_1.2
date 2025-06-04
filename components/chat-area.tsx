"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, MoreVertical, Phone, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Chat, Message } from "@/types/chat"
import { useChat } from "@ai-sdk/react"

interface ChatAreaProps {
  chat: Chat
  onMessageSent: (message: Omit<Message, "id" | "timestamp">) => void
  isTyping: boolean
  setIsTyping: (typing: boolean) => void
}

export function ChatArea({ chat, onMessageSent, isTyping, setIsTyping }: ChatAreaProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, append, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: chat.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
    })),
    onFinish: (message) => {
      onMessageSent({
        content: message.content,
        role: "assistant",
      })
      setIsTyping(false)
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    setIsTyping(isLoading)
  }, [isLoading, setIsTyping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")

    // Добавляем сообщение пользователя
    onMessageSent({
      content: userMessage,
      role: "user",
    })

    // Отправляем в AI только если это AI чат
    if (chat.type === "ai") {
      await append({
        role: "user",
        content: userMessage,
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {chat.avatar || chat.name.charAt(0)}
            </div>
            {chat.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{chat.name}</h2>
            <p className="text-sm text-gray-500">{chat.isOnline ? "в сети" : "был(а) недавно"}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chat.messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.role === "user"
                  ? "bg-blue-500 text-white rounded-br-md"
                  : "bg-white text-gray-900 rounded-bl-md shadow-sm"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <div className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
              className="min-h-[44px] max-h-32 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              rows={1}
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 h-11 w-11"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
