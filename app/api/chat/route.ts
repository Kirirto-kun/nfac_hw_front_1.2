import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json()

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
      system: "Ты дружелюбный AI-ассистент в мессенджере. Отвечай кратко и по делу, как в обычной переписке.",
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
