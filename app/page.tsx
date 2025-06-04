"use client"

import { useEffect } from "react"
import { ChatList } from "@/components/chat-list"
import { ChatArea } from "@/components/chat-area"
import { useChats } from "@/hooks/useChats"
import { MessageCircle } from "lucide-react"

export default function TelegramChat() {
  const {
    chats,
    activeChat,
    currentChat,
    searchQuery,
    isTyping,
    setActiveChat,
    setSearchQuery,
    setIsTyping,
    addMessage,
    markAsRead,
  } = useChats()

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
