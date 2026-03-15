import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import authRoutes from './routes/authRoutes.js'
import accountRoutes from './routes/accountRoutes.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  }),
)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Account Management API is running.' })
})

app.use('/api/auth', authRoutes)
app.use('/api/account', accountRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
