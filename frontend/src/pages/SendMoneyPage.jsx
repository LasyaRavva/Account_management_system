import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatCurrency } from '../utils/formatters.js'

const SendMoneyPage = () => {
  const { updateUser } = useAuth()
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({ receiverId: '', amount: '' })
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true)
      setError('')

      try {
        const response = await api.get('/account/users')
        setUsers(response.data.users)
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load registered users.')
      } finally {
        setIsLoadingUsers(false)
      }
    }

    loadUsers()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await api.post('/account/transfer', {
        receiverId: formData.receiverId,
        amount: Number(formData.amount),
      })

      const targetUser = users.find((user) => user.id === formData.receiverId)
      updateUser((currentUser) => ({
        ...(currentUser || {}),
        balance: response.data.senderBalance,
      }))
      setSuccessMessage(
        `Transferred ${formatCurrency(formData.amount)} to ${targetUser?.name || 'the selected user'}.`,
      )
      setFormData({ receiverId: '', amount: '' })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to process the transfer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="dashboard-grid single-column">
      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Transfer funds</p>
            <h2>Send money to another registered user</h2>
          </div>
        </div>

        <form className="transfer-form" onSubmit={handleSubmit}>
          <label>
            <span>Recipient</span>
            <select
              name="receiverId"
              value={formData.receiverId}
              onChange={handleChange}
              disabled={isLoadingUsers || isSubmitting}
              required
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Amount</span>
            <input
              type="number"
              min="1"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount in INR"
              disabled={isSubmitting}
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}
          {successMessage ? <p className="form-success">{successMessage}</p> : null}

          <button type="submit" className="primary-button" disabled={isLoadingUsers || isSubmitting}>
            {isSubmitting ? 'Processing transfer...' : 'Send Money'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default SendMoneyPage
