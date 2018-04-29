// MODULES

// Encyption Module for Hash Generation
const SHA256 = require('crypto-js/sha256');

// ----------------------------------------
// CLASSES ->

// Block class
class transactionBlock {
  constructor (data, prevHash = '') {
    this.timestamp = new Date();
    this.prevHash = prevHash;
    this.data = JSON.parse(JSON.stringify(data));
    if (this.data === "Genesis Block") {
      this.hash = this.calculateHash();
    }
    else {
      this.hash = '';
    }
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(this.prevHash + this.timestamp + this.nonce + JSON.stringify(this.data)).toString();
  }

  mineBlock(difficulty, ledgerNum) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

// Blockchain class
class ledgerChain {
  constructor () {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.chainHash = this.calculateChainHash();
  }

  calculateChainHash(test) {
    let totalHash = '';
    for (var i = 0; i < this.chain.length; i++) {
      totalHash += this.chain[i].hash;
    }
    return totalHash;
  }

  createGenesisBlock() {
     return new transactionBlock(new Date(), "Genesis Block", "0")
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock, ledgerNum) {
    newBlock.prevHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty, ledgerNum);
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (var i = 1; i < this.chain.length; i++) {
      if (this.chain[i].prevHash != this.chain[i-1].hash) {
        console.log('\nA hash was changed illegally.');
        console.log(this);
        return false;
      }
      if (this.chain[i].hash != this.chain[i].calculateHash()) {
        console.log('\nBlock data was changed illegally.');
        console.log('Current hash: ' + this.chain[i].hash + '\nCalculated hash: ' + this.chain[i].calculateHash());
        return false;
      }
    }
    return true;
  }

  viewContents() {
    let tempChain = JSON.parse(JSON.stringify(this));
    for (var i = 0; i < tempChain.chain.length; i++) {
      tempChain.chain[i].data = JSON.stringify(tempChain.chain[i].data);
    }
    return tempChain;
  }
}

// Consolidated list class
class consolidatedList {
  constructor () {
    this.ledgerList = [];
  }

  addToList(newLedgers) {
    for (var i = 0; i < newLedgers.length; i++) {
      this.ledgerList.push(newLedgers[i]);
    }
  }

  propagateBlock(ledgerNum, blockNum) {

  }
}
// ----------------------------------------
// FUNCTIONS

// Blockchain replacement
function replaceContents(copies, badCopy, goodCopy) {
  copies[badCopy] = new ledgerChain();

  for (var i = 0; i < copies[goodCopy].chain.length; i++) {
    copies[badCopy].addBlock(new transactionBlock(JSON.parse(JSON.stringify(copies[goodCopy].chain[i].data)), badCopy));
  }

  copies[badCopy].chainHash = copies[badCopy].calculateChainHash();
}

// ----------------------------------------
// VARIABLES

// Temporary Subsidiary Ledgers
let ledgers = [ledgerOne = new ledgerChain(), ledgerTwo = new ledgerChain(), ledgerThree = new ledgerChain()]

// Temporary Ledger Data
const transactionList = [
  {
    'From': 'Company A',
    'To': 'Company B',
    'Amount': 100,
  },
  {
    'From': 'Company A',
    'To': 'Company C',
    'Amount': 50,
  },
  {
    'From': 'Company B',
    'To': 'Company A',
    'Amount': 25,
  },
];

// Temporary chain demerit point storage for inter-chain validation purposes
let ledgerDemerits = [0, 0, 0];

// ----------------------------------------
// BLOCK CREATIONS

for (var i = 0; i < transactionList.length; i++) {
  ledgerOne.addBlock(new transactionBlock(transactionList[i]), 1);
  ledgerTwo.addBlock(new transactionBlock(transactionList[i]), 2);
  ledgerThree.addBlock(new transactionBlock(transactionList[i]), 3);
}

// ----------------------------------------
// BLOCK DATA TAMPERING

// Illegal Data Change
ledgerTwo.chain[2].data.Amount = 75;

// Illegal hash change (Illegal chain validation)
for (var i = 1; i < ledgerTwo.chain.length; i++) {
  ledgerTwo.chain[i].hash = '';
  ledgerTwo.chain[i].prevHash = ledgerTwo.chain[i-1].hash;
  ledgerTwo.chain[i].mineBlock(ledgerTwo.difficulty);
  ledgerTwo.chainHash = ledgerTwo.calculateChainHash();
}

// ----------------------------------------
// CHAIN VALIDATION CHECK

// Intra-chain validation
console.log('Is Chain 1 Valid? ' + ledgerOne.isChainValid());
console.log('Is Chain 2 Valid? ' + ledgerTwo.isChainValid());
console.log('Is Chain 3 Valid? ' + ledgerThree.isChainValid());

//  Inter-chain validation
for (var i = 0; i < ledgers.length; i++) {
  let currentLedger = ledgers[i];
  for (var j = 0; j < ledgers.length; j++) {
    let nextLedger = ledgers[j];
    if (currentLedger.chainHash != nextLedger.chainHash) {
      ledgerDemerits[i]++;
      ledgerDemerits[j]++;
    }
  }
}

// ----------------------------------------
// FRAUDULENT CHAIN OVERIDE

// Indexes of most fraudulent and safest chains in Temporary Subsidiary Ledgers array
var maxIndex = ledgerDemerits.indexOf(Math.max(...ledgerDemerits));
var minIndex = ledgerDemerits.indexOf(Math.min(...ledgerDemerits));

// Ledger comparison results
console.log(ledgerDemerits);
console.log('Flagged Ledger: ' + maxIndex);

// Fraudulent ledger contents pre-override
console.log('\nOriginal Ledger: ');
console.log(ledgers[maxIndex].viewContents());

// Fraudulent ledger content override
replaceContents(ledgers, maxIndex, minIndex);

// Frudulent ledger contents post-override
console.log('\nCorrect Ledger: ');
console.log(ledgers[maxIndex].viewContents());
