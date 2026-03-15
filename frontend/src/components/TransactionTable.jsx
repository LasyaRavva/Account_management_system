import { useAuth } from '../context/AuthContext.jsx'
import { formatCurrency, formatDate } from '../utils/formatters.js'

const TransactionTable = ({ transactions, emptyMessage }) => {
  const { user } = useAuth()

  if (!transactions.length) {
    return <div className="empty-card">{emptyMessage}</div>
  }

  return (
    <div className="table-card">
      <table className="statement-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>From</th>
            <th>To</th>
            <th>Balance After Transaction</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{formatDate(transaction.date)}</td>
              <td>
                <span className={`type-badge ${transaction.type}`}>
                  {transaction.type}
                </span>
              </td>
              <td>{formatCurrency(transaction.amount)}</td>
              <td>{transaction.senderId === user?.id ? 'You' : transaction.senderName}</td>
              <td>{transaction.receiverId === user?.id ? 'You' : transaction.receiverName}</td>
              <td>{formatCurrency(transaction.balanceAfterTransaction)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionTable
