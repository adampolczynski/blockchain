const SHA256 = require('crypto-js/sha256.js')

class Block {
    constructor(timestamp, lastHash, hash, data, validator, signature) {
        this.timestamp = timestamp
        this.lastHash = lastHash
        this.hash = hash
        this.data = data
        this.validator = validator
        this.signature = signature
    }

    toString() {
        return `Block - 
          Timestamp : ${this.timestamp}
          Last Hash : ${this.lastHash}
          Hash      : ${this.hash}
          Data      : ${this.data}
          Validator : ${this.validator}
          Signature : ${this.signature}`
    }

    static genesis() {
        return new this(`genesis time`, '----', 'genesis-hash', [])
    }

    static hash(timestamp, lastHash, data) {
        return SHA256(`${timestamp}${lastHash}${data}`).toString()
    }

    static blockHash(block) {
        //destructuring
        const { timestamp, lastHash, data } = block
        return this.hash(timestamp, lastHash, data)
    }

    static createBlock(lastBlock, data, wallet) {
        let hash
        let timestamp = Date.now()
        const lastHash = lastBlock.hash
        hash = Block.hash(timestamp, lastHash, data)

        // get the validators public key
        let validator = wallet.getPublicKey()

        // Sign the block
        let signature = Block.signBlockHash(hash, wallet)
        return new this(timestamp, lastHash, hash, data, validator, signature)
    }
}

class Blockchain {
    constructor() {
        console.log('blockchain constructor, ', [Block.genesis()])
        this.chain = [Block.genesis()]
    }
    addBlock(data) {
        const block = Block.createBlock(this.chain[this.chain.length - 1], data)
        this.chain.push(block)

        return block
    }
    createBlock(transactions, wallet) {
        const block = Block.createBlock(
            this.chain[this.chain.length - 1],
            transactions,
            wallet
        )
        return block
    }

    isValidBlock(block) {
        const lastBlock = this.chain[this.chain.length - 1]
        /**
         * check hash
         * check last hash
         * check signature
         * check leader
         */
        if (
            block.lastHash === lastBlock.hash &&
            block.hash === Block.blockHash(block) &&
            Block.verifyBlock(block) &&
            Block.verifyLeader(block, this.getLeader())
        ) {
            console.log('block valid')
            this.addBlock(block)
            return true
        } else {
            return false
        }
    }
    isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            console.log(JSON.stringify(chain))
            console.log('Genesis node doesnt match')
            return false
        }
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i]
            const lastBlock = chain[i - 1]
            if (
                block.lastHash !== lastBlock.hash ||
                block.hash.toString() !== Block.blockHash(block)
            ) {
                console.log('Hash signatures integrity check failed')
                return false
            }
        }

        return true
    }

    replaceChain(newChain) {
        if (newChain.length <= this.chain.length) {
            console.log('Recieved chain is not longer than the current chain')
            return
        } else if (!this.isValidChain(newChain)) {
            console.log('Recieved chain is invalid')
            return
        }

        console.log('Replacing the current chain with new chain')
        this.chain = newChain
    }

    getBalance(publicKey) {
        return this.accounts.getBalance(publicKey)
    }

    getLeader() {
        return this.stakes.getMax(this.validators.list)
    }

    executeTransactions(block) {
        block.data.forEach((transaction) => {
            switch (transaction.type) {
                case TRANSACTION_TYPE.transaction:
                    this.accounts.update(transaction)
                    this.accounts.transferFee(block, transaction)
                    break
                case TRANSACTION_TYPE.stake:
                    this.stakes.update(transaction)
                    this.accounts.decrement(
                        transaction.input.from,
                        transaction.output.amount
                    )
                    this.accounts.transferFee(block, transaction)

                    break
                case TRANSACTION_TYPE.validator_fee:
                    if (this.validators.update(transaction)) {
                        const {
                            input: { from },
                            output: { amount },
                        } = transaction
                        this.accounts.decrement(from, amount)
                        this.accounts.transferFee(block, transaction)
                    }
                    break
            }
        })
    }
}

module.exports = Blockchain
