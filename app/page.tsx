"use client"

import { useEffect, useState } from "react"
import { ChatList } from "@/components/chat-list"
import { ChatArea } from "@/components/chat-area"
import { useQueryChats } from "@/hooks/use-query-chats"
import { MessageCircle } from "lucide-react"

export default function TelegramChat() {
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const { chats, isLoading, getChat, addMessage, markAsRead } = useQueryChats(searchQuery)
  const currentChat = getChat(activeChat)

  // Устанавливаем первый чат как активный при загрузке
  useEffect(() => {
    if (chats.length > 0 && !activeChat) {
      setActiveChat(chats[0].id)
    }
  }, [chats, activeChat])

  // Отмечаем чат как прочитанный при его выборе
  useEffect(() => {
    if (activeChat) {
      markAsRead(activeChat)
    }
  }, [activeChat, markAsRead])

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId)
    markAsRead(chatId)
  }

  const handleMessageSent = (message: Parameters<typeof addMessage>[1]) => {
    if (activeChat) {
      addMessage(activeChat, message)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <ChatList
        chats={chats}
        activeChat={activeChat}
        searchQuery={searchQuery}
        onChatSelect={handleChatSelect}
        onSearchChange={setSearchQuery}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <ChatArea
            chat={currentChat}
            onMessageSent={handleMessageSent}
            isTyping={isTyping}
            setIsTyping={setIsTyping}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Выберите чат</h3>
              <p>Выберите чат из списка слева, чтобы начать общение</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
