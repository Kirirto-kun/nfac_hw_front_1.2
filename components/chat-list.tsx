"use client"

import { Search, Plus, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Chat } from "@/types/chat"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"

interface ChatListProps {
  chats: Chat[]
  activeChat: string | null
  searchQuery: string
  onChatSelect: (chatId: string) => void
  onSearchChange: (query: string) => void
}

export function ChatList({ chats, activeChat, searchQuery, onChatSelect, onSearchChange }: ChatListProps) {
  const formatTime = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: ru,
    })
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Чаты</h1>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-gray-50 border-0 focus:bg-white"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <MessageCircle className="h-8 w-8 mb-2" />
            <p>Чаты не найдены</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                activeChat === chat.id ? "bg-blue-50 border-r-2 border-r-blue-500" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {chat.avatar || chat.name.charAt(0)}
                  </div>
                  {chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500">{formatTime(chat.lastMessage.timestamp)}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage?.content || "Нет сообщений"}</p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
