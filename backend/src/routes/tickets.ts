import { Router } from 'express'
import { getAllTickets, getTicketById, updateTicket, getStats } from '../controllers/ticketController'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, requireAdmin, getAllTickets)
router.get('/stats', authenticate, requireAdmin, getStats)
router.get('/:id', authenticate, requireAdmin, getTicketById)
router.patch('/:id', authenticate, requireAdmin, updateTicket)

export default router
