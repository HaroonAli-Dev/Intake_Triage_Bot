import Groq from 'groq-sdk'
import dotenv from 'dotenv'
import { AIResponse, Message } from '../types/index'
dotenv.config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are an AI Intake Triage Agent for a medical clinic. Your job is to:
1. Greet the patient warmly and understand their request or problem
2. Identify the category: Appointment, Medical Concern, Billing, Complaint, General Inquiry, or Technical Issue
3. Determine urgency: Low, Medium, High, or Critical
4. Ask follow-up questions to gather all required information
5. Once enough info is gathered, generate a structured support ticket

Clinic department routing:
- Appointment → Reception / Scheduling Team
- Medical Concern → Medical/Clinical Staff
- Billing → Billing & Finance Department
- Complaint → Patient Relations / Quality Assurance
- General Inquiry → Front Desk Staff
- Technical Issue → IT Support

Examples of questions patients may ask:
- Appointment booking, rescheduling, or cancellation
- Doctor availability and clinic timing
- Medical symptoms or health concerns
- Prescription refills or medical records
- Bill disputes or payment questions
- Complaints about staff or service quality
- Clinic location, hours, or facilities
- Website or portal not working

Rules:
- Only answer questions related to the clinic and its services
- If a question is completely unrelated to the clinic, politely say you can only assist with clinic-related matters
- If the issue is Critical (e.g. emergency, severe symptoms, chest pain) set escalate to true and advise the patient to call emergency services immediately
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
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: userMessage }
  ]

  const result = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.7,
  })

  const text = result.choices[0]?.message?.content?.trim() || ''

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
