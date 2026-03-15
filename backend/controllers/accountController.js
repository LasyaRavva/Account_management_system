import { supabase } from '../config/supabaseClient.js'

const formatCurrencyValue = (value) => Number.parseFloat(value)

export const getBalance = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, balance, created_at')
      .eq('id', req.user.userId)
      .single()

    if (error) {
      throw error
    }

    return res.status(200).json({
      user: {
        ...user,
        balance: formatCurrencyValue(user.balance),
      },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch balance.' })
  }
}

export const getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email')
      .neq('id', req.user.userId)
      .order('name', { ascending: true })

    if (error) {
      throw error
    }

    return res.status(200).json({ users })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch users.' })
  }
}

export const getStatement = async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('id, transfer_ref, sender_id, receiver_id, amount, transaction_type, balance_after_transaction, created_at')
      .or(`sender_id.eq.${req.user.userId},receiver_id.eq.${req.user.userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    const participantIds = [...new Set(
      transactions.flatMap((transaction) => [transaction.sender_id, transaction.receiver_id]),
    )]

    let usersById = {}

    if (participantIds.length) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', participantIds)

      if (usersError) {
        throw usersError
      }

      usersById = Object.fromEntries(users.map((user) => [user.id, user]))
    }

    const statement = transactions.map((transaction) => ({
      id: transaction.id,
      transferRef: transaction.transfer_ref,
      date: transaction.created_at,
      type: transaction.transaction_type,
      amount: formatCurrencyValue(transaction.amount),
      senderId: transaction.sender_id,
      receiverId: transaction.receiver_id,
      senderName: usersById[transaction.sender_id]?.name || 'Unknown User',
      receiverName: usersById[transaction.receiver_id]?.name || 'Unknown User',
      balanceAfterTransaction: formatCurrencyValue(transaction.balance_after_transaction),
    }))

    return res.status(200).json({ statement })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch statement.' })
  }
}

export const transferMoney = async (req, res) => {
  try {
    const receiverId = req.body.receiverId?.trim()
    const amount = Number.parseFloat(req.body.amount)

    if (!receiverId || Number.isNaN(amount)) {
      return res.status(400).json({ message: 'Receiver and amount are required.' })
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Transfer amount must be greater than zero.' })
    }

    if (receiverId === req.user.userId) {
      return res.status(400).json({ message: 'You cannot transfer money to your own account.' })
    }

    const { data, error } = await supabase.rpc('transfer_funds', {
      p_sender_id: req.user.userId,
      p_receiver_id: receiverId,
      p_amount: amount,
    })

    if (error) {
      const normalizedMessage = error.message || 'Money transfer failed.'
      const statusCode = normalizedMessage.toLowerCase().includes('insufficient') || normalizedMessage.toLowerCase().includes('not found')
        ? 400
        : 500

      return res.status(statusCode).json({ message: normalizedMessage })
    }

    return res.status(200).json({
      message: 'Transfer completed successfully.',
      senderBalance: formatCurrencyValue(data.sender_balance),
      receiverBalance: formatCurrencyValue(data.receiver_balance),
      transferRef: data.transfer_ref,
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Money transfer failed.' })
  }
}
