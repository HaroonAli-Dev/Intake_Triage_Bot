import { Router } from 'express'
import { getAllTickets, getTicketById, updateTicket, getStats } from '../controllers/ticketController'

const router = Router()

router.get('/', getAllTickets)
router.get('/stats', getStats)
router.get('/:id', getTicketById)
router.patch('/:id', updateTicket)

export default router
