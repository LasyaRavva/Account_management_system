import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import TransactionTable from '../components/TransactionTable.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatCurrency } from '../utils/formatters.js'

const DashboardPage = () => {
  const { updateUser } = useAuth()
  const [balance, setBalance] = useState(0)
  const [statement, setStatement] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [balanceResponse, statementResponse] = await Promise.all([
          api.get('/account/balance'),
          api.get('/account/statement'),
        ])

        setBalance(balanceResponse.data.user.balance)
        setStatement(statementResponse.data.statement)
        updateUser((currentUser) => ({
          ...(currentUser || {}),
          ...balanceResponse.data.user,
          balance: balanceResponse.data.user.balance,
        }))
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load your dashboard.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [updateUser])

  if (isLoading) {
    return <div className="page-state">Loading your account overview...</div>
  }

  if (error) {
    return <div className="page-state error-state">{error}</div>
  }

  return (
    <div className="dashboard-grid">
      <section className="hero-card">
        <p className="eyebrow">Live balance</p>
        <h2>{formatCurrency(balance)}</h2>
        <p>
          Your account reflects the latest completed transfer and is synced with the statement below.
        </p>
        <div className="cta-row">
          <Link to="/send-money" className="primary-button button-link">
            Send Money
          </Link>
          <Link to="/statement" className="secondary-button button-link">
            View Full Statement
          </Link>
        </div>
      </section>

      <section className="stats-card">
        <h3>Account snapshot</h3>
        <div className="stat-row">
          <span>Opening balance</span>
          <strong>{formatCurrency(10000)}</strong>
        </div>
        <div className="stat-row">
          <span>Total entries</span>
          <strong>{statement.length}</strong>
        </div>
        <div className="stat-row">
          <span>Latest activity</span>
          <strong>{statement[0] ? statement[0].type.toUpperCase() : 'NONE'}</strong>
        </div>
      </section>

      <section className="section-card section-card-wide">
        <div className="section-head">
          <div>
            <p className="eyebrow">Recent activity</p>
            <h3>Latest account statement entries</h3>
          </div>
        </div>
        <TransactionTable
          transactions={statement.slice(0, 5)}
          emptyMessage="No transfers yet. Send money to another registered user to generate your first statement entry."
        />
      </section>
    </div>
  )
}

export default DashboardPage
