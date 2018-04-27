const SHA256 = require('crypto-js/sha256');

class Block {
  constructor (index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(this.index + this.previousHash + this.timestamp + this.nonce + JSON.stringify(this.data)).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log('Block mined: ' + this.hash);
  }
}

class Blockchain {
  constructor () {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3;
  }

  createGenesisBlock() {
     return new Block(0, "01/01/2017", "Genesis Block", "0")
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (var i = 1; i < this.chain.length; i++) {
      // console.log('\n' + this.chain[i].index);
      // console.log(this.chain[i].data);
      // console.log(this.chain[i].hash + '\n' + this.chain[i].calculateHash());
      if (this.chain[i].previousHash != this.chain[i-1].hash) {
        return false;
      }
      if (this.chain[i].hash != this.chain[i].calculateHash()) {
        return false;
      }
    }
    return true;
  }
}

let savjeeCoin = new Blockchain();

console.log("Mining Block 1...");
savjeeCoin.addBlock(new Block(1, "10/07/2017", { amount: 100 }));

console.log("Mining Block 2...");
savjeeCoin.addBlock(new Block(2, "11/07/2017", { amount: 10 }));
// savjeeCoin.addBlock(new Block(3, "11/07/2017", { amount: 20 }));

// console.log(savjeeCoin.chain[1].hash);
savjeeCoin.chain[1].data = {amount: 1000};
// console.log(savjeeCoin.chain[1].hash);
// console.log(savjeeCoin.chain[1].calculateHash());

// savjeeCoin.chain[1].hash = savjeeCoin.chain[1].calculateHash();
//
// // console.log(savjeeCoin.chain.length);
//
// for (var i = 1; i < savjeeCoin.chain.length; i++) {
//   // console.log(i + '\n' + savjeeCoin.chain[i].hash + '\n' + savjeeCoin.chain[i].calculateHash());
//   savjeeCoin.chain[i].previousHash = savjeeCoin.chain[i-1].hash;
//   savjeeCoin.chain[i].hash = savjeeCoin.chain[i].calculateHash();
//   // console.log(savjeeCoin.chain[i].hash + '\n' + savjeeCoin.chain[i].calculateHash() + '\n\n');
// }
//
console.log(savjeeCoin.isChainValid());

// print process.argv
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
