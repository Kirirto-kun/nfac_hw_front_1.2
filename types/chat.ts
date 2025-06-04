export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: number
  status?: "sending" | "sent" | "delivered" | "read"
}

export interface Chat {
  id: string
  name: string
  type: "human" | "ai"
  avatar?: string
  lastMessage?: Message
  unreadCount: number
  isOnline?: boolean
  lastSeen?: number
  messages: Message[]
}

export interface ChatState {
  chats: Chat[]
  activeChat: string | null
  searchQuery: string
  isTyping: boolean
}
