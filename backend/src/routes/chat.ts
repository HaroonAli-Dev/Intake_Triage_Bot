import { Router } from 'express'
import { startConversation, sendMessage, getMessages } from '../controllers/chatController'

const router = Router()

router.post('/start', startConversation)
router.post('/message', sendMessage)
router.get('/:conversationId/messages', getMessages)

export default router
