const Wallet = require('./wallet')
const TransactionPool = require('../wallet/transaction-pool')
const router = require('express').Router()
const p2pServer = require('../server-p2p')

const wallet = new Wallet(Date.now().toString())

// Date.now() is used create a random string for secret
// create a new transaction pool which will be later
// decentralized and synchronized using the peer to peer server
const transactionPool = new TransactionPool()

// api to view transaction in the transaction
router.get('/transactions', (req, res) => {
    res.json(transactionPool.transactions)
})
router.post('/transact', (req, res) => {
    const { to, amount, type, blockchain } = req.body
    const transaction = wallet.createTransaction(
        to,
        amount,
        type,
        blockchain,
        transactionPool
    )
    p2pServer.broadcastTransaction(transaction)
    res.json(transactionPool.transactions)
})

module.exports = router
