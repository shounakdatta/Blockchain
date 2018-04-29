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
    this.calculateChainHash();
  }

  calculateChainHash(test) {
    let totalHash = '';
    for (var i = 0; i < this.chain.length; i++) {
      totalHash += this.chain[i].hash;
    }
    this.chainHash = totalHash;
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
    this.calculateChainHash();
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

  addBlock(blockData) {
    for (var i = 0; i < this.ledgerList.length; i++) {
      let newBlock = new transactionBlock(JSON.parse(JSON.stringify(blockData)));
      newBlock.prevHash = this.ledgerList[i].getLatestBlock().hash;
      newBlock.mineBlock(this.ledgerList[i].difficulty);
      this.ledgerList[i].chain.push(newBlock);
      this.ledgerList[i].calculateChainHash();
    }
  }
}
// ----------------------------------------
// FUNCTIONS

// Blockchain replacement
function replaceContents(copies, badCopy, goodCopy) {
  copies[badCopy] = new ledgerChain();
  console.log('Good copy: ' + goodCopy);

  for (var i = 0; i < copies[goodCopy].chain.length; i++) {
    // console.log('\n' + JSON.stringify(copies[2].chain[i].data));
    copies[badCopy].addBlock(new transactionBlock(JSON.parse(JSON.stringify(copies[goodCopy].chain[i].data)), badCopy));
  }

  copies[badCopy].calculateChainHash();
}

// ----------------------------------------
// VARIABLES

// Temporary Subsidiary Ledgers
let ledgers = [ledgerOne = new ledgerChain(), ledgerTwo = new ledgerChain(), ledgerThree = new ledgerChain()]
let ABCcorp = new consolidatedList();
ABCcorp.addToList(ledgers);

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
  ABCcorp.addBlock(transactionList[i]);
}

// ----------------------------------------
// BLOCK DATA TAMPERING

// Illegal Data Change
ABCcorp.ledgerList[1].chain[2].data.Amount = 75;

// Illegal hash change (Illegal chain validation)
for (var i = 1; i < ledgerTwo.chain.length; i++) {
  ABCcorp.ledgerList[1].chain[i].hash = '';
  ABCcorp.ledgerList[1].chain[i].prevHash = ledgerTwo.chain[i-1].hash;
  ABCcorp.ledgerList[1].chain[i].mineBlock(ledgerTwo.difficulty);
  ABCcorp.ledgerList[1].calculateChainHash();
}

// ----------------------------------------
// CHAIN VALIDATION CHECK

// Intra-chain validation
console.log('Is Chain 1 Valid? ' + ABCcorp.ledgerList[0].isChainValid());
console.log('Is Chain 2 Valid? ' + ABCcorp.ledgerList[1].isChainValid());
console.log('Is Chain 3 Valid? ' + ABCcorp.ledgerList[2].isChainValid());

//  Inter-chain validation
for (var i = 0; i < ABCcorp.ledgerList.length; i++) {
  let currentLedger = ABCcorp.ledgerList[i];
  for (var j = 0; j < ABCcorp.ledgerList.length; j++) {
    let nextLedger = ABCcorp.ledgerList[j];
    if (currentLedger.chainHash != nextLedger.chainHash) {
      ledgerDemerits[i]++;
      ledgerDemerits[j]++;
    }
  }
}

// ----------------------------------------
// FRAUDULENT CHAIN OVERIDE

if (Math.max(...ledgerDemerits) !== 0) {
  // Indexes of most fraudulent and safest chains in Temporary Subsidiary Ledgers array
  var maxIndex = ledgerDemerits.indexOf(Math.max(...ledgerDemerits));
  var minIndex = ledgerDemerits.indexOf(Math.min(...ledgerDemerits));

  // Ledger comparison results
  console.log(ledgerDemerits);
  console.log('Flagged Ledger: ' + maxIndex);

  // Fraudulent ledger contents pre-override
  console.log('\nOriginal Ledger: ');
  console.log(ABCcorp.ledgerList[maxIndex].viewContents());

  // Fraudulent ledger content override
  replaceContents(ABCcorp.ledgerList, maxIndex, minIndex);

  // Frudulent ledger contents post-override
  console.log('\nCorrect Ledger: ');
  console.log(ABCcorp.ledgerList[maxIndex].viewContents());
}
