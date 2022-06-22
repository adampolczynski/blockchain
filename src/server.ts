const express = require('express')
const Blockchain = require('./proof_of_stake.js')
const bodyParser = require('body-parser')
const P2PServer = require('./server-p2p.js')
const TransactionPool = require('./wallet/transaction-pool')
const cors = require('cors')
//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3001

//create a new app
const app = express()

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(bodyParser.json())

// create a new blockchain instance
const blockchain = new Blockchain()
const transactionPool = new TransactionPool()
const p2pServer = new P2PServer(blockchain, transactionPool)

//api to get the blocks
app.get('/blocks', (req, res) => {
    res.json(blockchain.chain)
})

//api to add blocks
app.post('/mine', (req, res) => {
    const block = blockchain.addBlock(req.body.data)
    console.log(`New block added: ${block.toString()}`)
    p2pServer.syncChain()
    res.redirect('/blocks')
})

app.use('/wallet', require('./wallet'))

function logErrors(err, req, res, next) {
    console.error(err)
    next(err)
}

function clientErrorHandler(err, req, res, next) {
    if (err) {
        console.error(err)
        next(err)
    } else {
        res.status(500).send({ error: 'Something failed!' })
    }
}
function handleMissing(req, res, next) {
    res.status(404).send('Unable to find the requested resource!')
}
app.use([handleMissing, logErrors, clientErrorHandler])

app.listen(HTTP_PORT, () => {
    console.log(`listening on port ${HTTP_PORT}`)
})
p2pServer.listen() // starts the p2pserver
