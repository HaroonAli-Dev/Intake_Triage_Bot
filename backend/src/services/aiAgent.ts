import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import { AIResponse, Message } from '../types/index'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

const SYSTEM_PROMPT = `You are an AI Intake Triage Agent for a university support system. Your job is to:
1. Greet the user and understand their problem
2. Identify the category: Admission, Fee Issue, Scholarship, Technical Support, Hostel, or FYP
3. Determine urgency: Low, Medium, High, or Critical
4. Ask follow-up questions to collect missing information
5. Once enough info is gathered, generate a support ticket

Department routing:
- Admission → Admissions Office
- Fee Issue → Finance Department
- Scholarship → Scholarship Office
- Technical Support → IT Department
- Hostel → Hostel Management
- FYP → Academic Department

Rules:
- If the issue is Critical or you are not confident, set escalate to true
- Only set ticketReady to true when you have enough info (category, priority, clear problem description)
- Always respond in JSON format exactly like this:
{
  "message": "your response to the user",
  "ticketReady": false,
  "escalate": false,
  "ticket": {
    "title": "",
    "summary": "",
    "category": "",
    "priority": "",
    "assigned_to": ""
  }
}
- ticket field is only required when ticketReady is true`

export const processMessage = async (
  userMessage: string,
  history: Message[]
): Promise<AIResponse> => {
  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: '{"message": "Understood. I am ready to assist users.", "ticketReady": false, "escalate": false}' }] },
      ...history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    ]
  })

  const result = await chat.sendMessage(userMessage)
  const text = result.response.text().trim()

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    return JSON.parse(jsonMatch[0]) as AIResponse
  } catch {
    return {
      message: text,
      ticketReady: false,
      escalate: false
    }
  }
}
