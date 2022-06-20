import SHA256 from 'crypto-js/sha256.js'
import moment from 'moment'

class CryptoBlock {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index
        this.timestamp = timestamp
        this.data = data
        this.previousHash = previousHash
        this.hash = this.computeHash()
        this.nonce = 0
    }

    computeHash() {
        return SHA256(`${this.index}${this.timestamp}${this.previousHash}${JSON.stringify(this.data)}${this.nonce}`).toString()
    }

    proofOfWork(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++
            this.hash = this.computeHash()
        }
    }
}



class CryptoBlockchain {
    constructor() {
        this.blockchain = [this.startGenesisBlock()]
        this.difficulty = 2
    }

    startGenesisBlock(){
        return new CryptoBlock(0, '01/01/2022', 'Initial block', {})
    }

    getLastBlock(){
        return this.blockchain[this.blockchain.length - 1]
    }
    addNewBlock(_block){
        _block.previousHash = this.getLastBlock().hash
        // _block.hash = _block.computeHash()
        _block.proofOfWork(this.difficulty)
        this.blockchain.push(_block)
    }
    checkIntegrity(){
        console.log(`Blockchain length: ${this.blockchain.length}`)
        for(let i = 1; i < this.blockchain.length; i++) {
            const currentBlock = this.blockchain[i]
            const precedingBlock= this.blockchain[i-1]

          if(currentBlock.hash !== currentBlock.computeHash()){
              return false
          }
          if(currentBlock.precedingHash !== precedingBlock.hash)
            return false
        }
        return true
    }

}

const chain = new CryptoBlockchain()

console.time('Creating 2000 coins...')
for (const _ of [...Array(2000).keys()]) {
    chain.addNewBlock(new CryptoBlock(1, moment().toDate(), {sender: "Iris Ljesnjanin", recipient: "Cosima Mielke", quantity: 50}))
}
console.timeEnd('Creating 2000 coins...')

console.time('Validating chain integrity...')
chain.checkIntegrity()
console.timeEnd('Validating chain integrity...')
