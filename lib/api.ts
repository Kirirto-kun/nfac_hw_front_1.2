import type { Chat, Message } from "@/types/chat"

const STORAGE_KEY = "telegram-ai-chats"

// Начальные данные для чатов
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

// API для работы с чатами
export const chatApi = {
  // Получить все чаты
  getChats: async (): Promise<Chat[]> => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error("Error loading chats:", error)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultChats))
        return defaultChats
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultChats))
    return defaultChats
  },

  // Получить чат по ID
  getChat: async (chatId: string): Promise<Chat | undefined> => {
    const chats = await chatApi.getChats()
    return chats.find((chat) => chat.id === chatId)
  },

  // Добавить сообщение в чат
  addMessage: async (chatId: string, message: Omit<Message, "id" | "timestamp">): Promise<Message> => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      status: "sent",
    }

    const chats = await chatApi.getChats()
    const updatedChats = chats.map((chat) => {
      if (chat.id === chatId) {
        const updatedMessages = [...chat.messages, newMessage]
        return {
          ...chat,
          messages: updatedMessages,
          lastMessage: newMessage,
          unreadCount: message.role === "assistant" ? chat.unreadCount + 1 : chat.unreadCount,
        }
      }
      return chat
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats))
    return newMessage
  },

  // Отметить чат как прочитанный
  markAsRead: async (chatId: string): Promise<void> => {
    const chats = await chatApi.getChats()
    const updatedChats = chats.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat))

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats))
  },

  // Поиск чатов
  searchChats: async (query: string): Promise<Chat[]> => {
    const chats = await chatApi.getChats()
    return chats.filter((chat) => chat.name.toLowerCase().includes(query.toLowerCase()))
  },
}
