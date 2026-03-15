import { Router } from 'express'
import {
  getBalance,
  getStatement,
  getUsers,
  transferMoney,
} from '../controllers/accountController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'

const router = Router()

router.use(authenticateToken)
router.get('/balance', getBalance)
router.get('/statement', getStatement)
router.post('/transfer', transferMoney)
router.get('/users', getUsers)

export default router
