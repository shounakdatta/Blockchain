const SHA256 = require('crypto-js/sha256');

class transactionBlock {
  constructor (timestamp, data, prevHash = '') {
    this.timestamp = timestamp;
    this.previousHash = previousHash;
    this.hash = '';
    this.nonce = 0;
  }

  calculateHash(data) {
    return SHA256(this.previousHash + this.timestamp + this.nonce + JSON.stringify(data)).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash(hash);
    }
    console.log('Transaction mined: ' + this.hash);
  }
}

class ledgerChain {
  constructor () {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3;
  }

  createGenesisBlock() {
     return new Block(new Date(), "Genesis Block", "0")
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }
}

let ledgerOne = new ledgerChain();
let transactionList = [
  {
    'From': 'Company A',
    'To': 'Company B',
    'Amount': 100,
  }
];
