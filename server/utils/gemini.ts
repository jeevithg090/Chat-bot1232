import {
  GoogleGenerativeAI,
  SchemaType,
  type Content,
  type ResponseSchema,
} from '@google/generative-ai'
import { buildSystemPrompt, parseAssistantReply, TODO_ACTIONS, type Assistant } from './assistant'

const RESPONSE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    type: { type: SchemaType.STRING, format: 'enum', enum: ['chat', 'action'] },
    reply: { type: SchemaType.STRING },
    action: { type: SchemaType.STRING, format: 'enum', enum: [...TODO_ACTIONS] },
    task: { type: SchemaType.STRING },
    id: { type: SchemaType.INTEGER },
  },
  required: ['type', 'reply'],
}

/** Assistant backed by Google Gemini, using structured JSON output. */
export function createGeminiAssistant(apiKey: string, modelName: string): Assistant {
  const genAI = new GoogleGenerativeAI(apiKey)

  return {
    kind: 'gemini',
    async decide(message, todos, history) {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: buildSystemPrompt(todos),
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        },
      })

      // Gemini requires the history to start with a user turn.
      const firstUser = history.findIndex((t) => t.role === 'user')
      const contents: Content[] = (firstUser === -1 ? [] : history.slice(firstUser)).map((t) => ({
        role: t.role === 'user' ? 'user' : 'model',
        parts: [{ text: t.text }],
      }))

      const chat = model.startChat({ history: contents })
      const result = await chat.sendMessage(message)
      return parseAssistantReply(result.response.text())
    },
  }
}
