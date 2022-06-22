const ChainUtil = require('../chain-util')
const Transaction = require('./transaction')
const INITAL_BALANCE = 100
const TRANSACTION_FEE = 1

class Wallet {
    constructor(secret) {
        this.balance = 100
        this.keyPair = ChainUtil.genKeyPair(secret)
        this.publicKey = this.keyPair.getPublic('hex')
    }

    toString() {
        return `Wallet - 
        publicKey: ${this.publicKey.toString()}
        balance  : ${this.balance}`
    }

    static usePublic() {
        this.keyPair = ChainUtil.genKeyPair()
        this.publicKey = this.keyPair.getPublic('hex')
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash).toHex()
    }
    sign(dataHash) {
        return this.keyPair.sign(dataHash)
    }
    createTransaction(to, amount, type, blockchain, transactionPool) {
        this.balance = this.getBalance(blockchain)
        if (amount > this.balance) {
            console.log(
                `Amount: ${amount} exceeds the current balance: ${this.balance}`
            )
            return
        }
        let transaction = Transaction.newTransaction(this, to, amount, type)
        transactionPool.addTransaction(transaction)
        return transaction
    }

    newTransaction(senderWallet, to, amount, type) {
        if (amount + TRANSACTION_FEE > senderWallet.balance) {
            console.log(`Not enough balance`)
            return
        }

        return Transaction.generateTransaction(senderWallet, to, amount, type)
    }

    getBalance(blockchain) {
        return blockchain.getBalance(this.publicKey)
    }

    getPublicKey() {
        return this.publicKey
    }
}

module.exports = Wallet
