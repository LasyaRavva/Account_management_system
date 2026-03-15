import { useEffect, useState } from 'react'
import api from '../api/client.js'
import TransactionTable from '../components/TransactionTable.jsx'

const StatementPage = () => {
  const [statement, setStatement] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStatement = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await api.get('/account/statement')
        setStatement(response.data.statement)
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load your account statement.')
      } finally {
        setIsLoading(false)
      }
    }

    loadStatement()
  }, [])

  if (isLoading) {
    return <div className="page-state">Loading your account statement...</div>
  }

  if (error) {
    return <div className="page-state error-state">{error}</div>
  }

  return (
    <div className="dashboard-grid single-column">
      <section className="section-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Transaction history</p>
            <h2>Account statement</h2>
          </div>
        </div>
        <TransactionTable
          transactions={statement}
          emptyMessage="Your statement is empty. Completed transfers will appear here as debit and credit entries."
        />
      </section>
    </div>
  )
}

export default StatementPage
