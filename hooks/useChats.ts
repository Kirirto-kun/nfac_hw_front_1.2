"use client"

import { useState, useEffect, useCallback } from "react"
import type { Chat, Message } from "@/types/chat"

const STORAGE_KEY = "telegram-ai-chats"

const defaultChats: Chat[] = [
  {
    id: "ai-assistant",
    name: "AI Ассистент",
    type: "ai",
    avatar: "🤖",
    unreadCount: 0,
    isOnline: true,
    messages: [
      {
        id: "1",
        content: "Привет! Я твой AI-ассистент. Чем могу помочь?",
        role: "assistant",
        timestamp: Date.now() - 3600000,
        status: "read",
      },
    ],
  },
  {
    id: "gpt-4",
    name: "GPT-4 Turbo",
    type: "ai",
    avatar: "🧠",
    unreadCount: 0,
    isOnline: true,
    messages: [],
  },
]

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Загрузка чатов из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsedChats = JSON.parse(saved)
        setChats(parsedChats)
        if (parsedChats.length > 0) {
          setActiveChat(parsedChats[0].id)
        }
      } catch (error) {
        console.error("Error loading chats:", error)
        setChats(defaultChats)
        setActiveChat(defaultChats[0].id)
      }
    } else {
      setChats(defaultChats)
      setActiveChat(defaultChats[0].id)
    }
  }, [])

  // Сохранение в localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
    }
  }, [chats])

  const addMessage = useCallback(
    (chatId: string, message: Omit<Message, "id" | "timestamp">) => {
      const newMessage: Message = {
        ...message,
        id: Date.now().toString(),
        timestamp: Date.now(),
        status: "sent",
      }

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId) {
            const updatedMessages = [...chat.messages, newMessage]
            return {
              ...chat,
              messages: updatedMessages,
              lastMessage: newMessage,
              unreadCount:
                message.role === "assistant" && chat.id !== activeChat ? chat.unreadCount + 1 : chat.unreadCount,
            }
          }
          return chat
        }),
      )

      return newMessage
    },
    [activeChat],
  )

  const markAsRead = useCallback((chatId: string) => {
    setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat)))
  }, [])

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const currentChat = chats.find((chat) => chat.id === activeChat)

  return {
    chats: filteredChats,
    activeChat,
    currentChat,
    searchQuery,
    isTyping,
    setActiveChat,
    setSearchQuery,
    setIsTyping,
    addMessage,
    markAsRead,
  }
}
