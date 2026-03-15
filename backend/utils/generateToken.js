import jwt from 'jsonwebtoken'

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'

export const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error('Missing JWT_SECRET in backend environment.')
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: JWT_EXPIRES_IN },
  )
}
