const ChainUtil = require('../chain-util')
const Transaction = require('./transaction')
const INITAL_BALANCE = 100
const TRANSACTION_FEE = 1

class Wallet {
    constructor(secret) {
        this.balance = 0
        this.keyPair = ChainUtil.genKeyPair(secret)
        this.publicKey = this.keyPair.getPublic('hex')
        this.balance = INITAL_BALANCE
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
        return this.keyPair.sign(dataHash)
    }
    createTransaction(to, amount, type, blockchain, transactionPool) {
        let transaction = this.newTransaction(this, to, amount, type)
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
}

module.exports = Wallet