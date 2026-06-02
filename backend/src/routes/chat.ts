import { Router } from 'express'
import { startConversation, sendMessage, getMessages } from '../controllers/chatController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/start', authenticate, startConversation)
router.post('/message', authenticate, sendMessage)
router.get('/:conversationId/messages', authenticate, getMessages)

export default router
