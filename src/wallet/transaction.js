const ChainUtil = require('../chain-util')
const { TRANSACTION_FEE } = require('./config')
const { removeCircularity } = require('../utils')

class Transaction {
    constructor() {
        this.id = ChainUtil.id()
        this.type = null
        this.input = null
        this.output = null
    }

    static generateTransaction(senderWallet, to, amount, type) {
        const transaction = new this()
        transaction.type = type
        transaction.output = {
            to: to,
            amount: amount - TRANSACTION_FEE,
            fee: TRANSACTION_FEE,
        }
        Transaction.signTransaction(transaction, senderWallet)
        return transaction
    }

    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            from: senderWallet.publicKey,
            signature: removeCircularity(
                senderWallet.sign(ChainUtil.hash(transaction.output))
            ), //senderWallet.sign(ChainUtil.hash(transaction.output))
        }
    }

    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(
            transaction.input.from,
            transaction.input.signature,
            ChainUtil.hash(transaction.output)
        )
    }
}

module.exports = Transaction
