"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { chatApi } from "@/lib/api"
import type { Message, Chat } from "@/types/chat"

export const queryKeys = {
  chats: ["chats"] as const,
  chat: (id: string) => ["chats", id] as const,
  searchChats: (query: string) => ["chats", "search", query] as const,
}

export function useQueryChats(searchQuery = "") {
  const queryClient = useQueryClient()

  const { data: chats = [], isLoading } = useQuery({
    queryKey: searchQuery ? queryKeys.searchChats(searchQuery) : queryKeys.chats,
    queryFn: () => (searchQuery ? chatApi.searchChats(searchQuery) : chatApi.getChats()),
  })

  const getChat = (chatId: string | null) => {
    if (!chatId) return undefined
    return chats.find((chat) => chat.id === chatId)
  }

  const addMessageMutation = useMutation({
    mutationFn: ({ chatId, message }: { chatId: string; message: Omit<Message, "id" | "timestamp"> }) =>
      chatApi.addMessage(chatId, message),

    onMutate: async ({ chatId, message }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.chats })

      const previousChats = queryClient.getQueryData<Chat[]>(queryKeys.chats)

      const optimisticMessage: Message = {
        ...message,
        id: `temp-${Date.now()}`,
        timestamp: Date.now(),
        status: "sending",
      }

      if (previousChats) {
        const updatedChats = previousChats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, optimisticMessage],
              lastMessage: optimisticMessage,
            }
          }
          return chat
        })

        queryClient.setQueryData(queryKeys.chats, updatedChats)
      }

      return { previousChats, optimisticMessage }
    },

    onError: (err, variables, context) => {
      if (context?.previousChats) {
        queryClient.setQueryData(queryKeys.chats, context.previousChats)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats })
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: (chatId: string) => chatApi.markAsRead(chatId),
    onSuccess: (_, chatId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats })
      queryClient.invalidateQueries({ queryKey: queryKeys.chat(chatId) })
    },
  })

  return {
    chats,
    isLoading,
    getChat,
    addMessage: (chatId: string, message: Omit<Message, "id" | "timestamp">) =>
      addMessageMutation.mutate({ chatId, message }),
    markAsRead: (chatId: string) => markAsReadMutation.mutate(chatId),
    isAddingMessage: addMessageMutation.isPending,
  }
}
