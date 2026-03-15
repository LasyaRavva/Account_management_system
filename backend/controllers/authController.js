import bcrypt from 'bcryptjs'
import { supabase } from '../config/supabaseClient.js'
import { generateToken } from '../utils/generateToken.js'

const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  balance: Number(user.balance),
  createdAt: user.created_at,
})

const buildAuthResponse = (user) => ({
  token: generateToken(user),
  user: formatUser(user),
})

export const signup = async (req, res) => {
  try {
    const name = req.body.name?.trim()
    const email = req.body.email?.trim().toLowerCase()
    const password = req.body.password?.trim()

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' })
    }

    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (lookupError) {
      throw lookupError
    }

    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
      })
      .select('id, name, email, balance, created_at')
      .single()

    if (insertError) {
      throw insertError
    }

    return res.status(201).json(buildAuthResponse(newUser))
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to create the account.',
    })
  }
}

export const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase()
    const password = req.body.password?.trim()

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password, balance, created_at')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const passwordMatches = await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    return res.status(200).json(buildAuthResponse(user))
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to log in.',
    })
  }
}
