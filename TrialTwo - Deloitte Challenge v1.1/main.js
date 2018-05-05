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
    this.id = '00';
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

  getID(transNum) {
    var address = this.data.From.substring(8,9);
    var newTransNum = (transNum+1);
    this.id = address+newTransNum;
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
  constructor (ledgerName) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 1;
    this.ledgerName = ledgerName;
    this.currency = 'USD'
    this.balance = 1000000;
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
    this.validCurrency = ['USD', 'CAD', 'GBP', 'BTC', 'ETH'];

  }

  addToList(newLedgers) {
    for (var i = 0; i < newLedgers.length; i++) {
      this.ledgerList.push(newLedgers[i]);
    }
  }

  checkCurrency(data) {
    var inputCurrency = data.Currency;
    for (var i = 0; i < this.validCurrency.length; i++) {
      if (inputCurrency === this.validCurrency[i]) {
        return true;
      }
    }
    return false;
  }

  getUSD(currency, amount) {
    var convertionRate = [1, 0.793, 1.431, 8054.995, 799.77]       //Convertion Rates for USD, CAD, GBP, BTC, and ETH respectively

    for (var i = 0; i < this.validCurrency.length; i++) {
      if (currency === this.validCurrency[i]) {
        return (amount*convertionRate[i]);
      }
    }
  }

  performTransaction(i, transData) {
    if (this.ledgerList[i].ledgerName === transData.From.substring(8,9)) {
      this.ledgerList[i].balance -= this.getUSD(transData.Currency, transData.Amount);
      // console.log('New Balance of Ledger ' + this.ledgerList[i].ledgerName + ': ' + this.ledgerList[i].balance + '\n');
    }
    if (this.ledgerList[i].ledgerName === transData.To.substring(8,9)) {
      this.ledgerList[i].balance += this.getUSD(transData.Currency, transData.Amount);
      // console.log('New Balance of Ledger ' + this.ledgerList[i].ledgerName + ': ' + this.ledgerList[i].balance + '\n');
    }
  }

  addBlock(blockData) {
    if (this.checkCurrency(blockData)) {
      for (var i = 0; i < this.ledgerList.length; i++) {
        let newBlock = new transactionBlock(JSON.parse(JSON.stringify(blockData)));
        newBlock.prevHash = this.ledgerList[i].getLatestBlock().hash;
        newBlock.getID(this.ledgerList[i].chain.length);
        newBlock.mineBlock(this.ledgerList[i].difficulty);
        this.performTransaction(i, blockData);
        this.ledgerList[i].chain.push(newBlock);
        this.ledgerList[i].calculateChainHash();
      }
    }
    else {
      console.log('ERROR: Currency not valid for the following transaction');
      console.log(blockData);
      console.log('\n');
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
    // console.log('\n' + JSON.stringify(copies[9].chain[i].data));
    copies[badCopy].addBlock(new transactionBlock(JSON.parse(JSON.stringify(copies[goodCopy].chain[i].data)), badCopy));
  }

  copies[badCopy].calculateChainHash();
}

// ----------------------------------------
// VARIABLES

// Temporary Subsidiary Ledgers
let ledgers = [ledgerA = new ledgerChain('A'), ledgerB = new ledgerChain('B'), ledgerC = new ledgerChain('C') ,ledgerD = new ledgerChain('D'), ledgerE = new ledgerChain('E'), ledgerF = new ledgerChain('F'), ledgerG = new ledgerChain('G'), ledgerH = new ledgerChain('H'), ledgerI = new ledgerChain('I')];
let ABCcorp = new consolidatedList();
ABCcorp.addToList(ledgers);

// Temporary Ledger Data
const transactionList = [
  {
    'From': 'Company A',
    'To': 'Company B',
    'Currency': 'USD',
    'Amount': 1000,
  },
  {
    'From': 'Company A',
    'To': 'Company C',
    'Currency': 'USD',
    'Amount': 5000,
  },
  {
    'From': 'Company B',
    'To': 'Company A',
    'Currency': 'CAD',
    'Amount': 2500,
  },
  {
    'From': 'Company A',
    'To': 'Company  D',
    'Currency': 'CAD',
    'Amount': 12500,
  },
  {
    'From': 'Company A' ,
    'To': 'Company  E',
    'Currency': 'GBP',
    'Amount': 2150,
  },
  {
    'From': 'Company B',
    'To': 'Company  C',
    'Currency': 'GBP',
    'Amount': 25100,
  },
  {
    'From': 'Company B',
    'To': 'Company  D',
    'Currency': 'BTC',
    'Amount': 1,
  },
  {
    'From': 'Company B',
    'To': 'Company  F',
    'Currency': 'BTC',
    'Amount': 2,
  },
  {
    'From': 'Company C',
    'To': 'Company  A',
    'Currency': 'ETH',
    'Amount': 9,
  },

];

// Temporary chain demerit point storage for inter-chain validation purposes
let ledgerDemerits = [0, 0, 0, 0, 0, 0, 0, 0 , 0];

// ----------------------------------------
// BLOCK CREATIONS

for (var i = 0; i < transactionList.length; i++) {
  ABCcorp.addBlock(transactionList[i]);
}

// ----------------------------------------
// BLOCK DATA TAMPERING - can comment out if required

// Illegal Data Change
ABCcorp.ledgerList[2].chain[2].data.Amount = 75;

// Illegal hash change (Illegal chain validation)
for (var i = 1; i < ABCcorp.ledgerList[2].chain.length; i++) {
  ABCcorp.ledgerList[2].chain[i].hash = '';
  ABCcorp.ledgerList[2].chain[i].prevHash = ABCcorp.ledgerList[2].chain[i-1].hash;
  ABCcorp.ledgerList[2].chain[i].mineBlock(ABCcorp.ledgerList[2].difficulty);
  ABCcorp.ledgerList[2].calculateChainHash();
}

// ----------------------------------------
// CHAIN VALIDATION CHECK

// Intra-chain validation
console.log('Is Chain 1 Valid? ' + ABCcorp.ledgerList[0].isChainValid());
console.log('Is Chain 2 Valid? ' + ABCcorp.ledgerList[1].isChainValid());
console.log('Is Chain 3 Valid? ' + ABCcorp.ledgerList[2].isChainValid());
console.log('Is Chain 4 Valid? ' + ABCcorp.ledgerList[3].isChainValid());
console.log('Is Chain 5 Valid? ' + ABCcorp.ledgerList[4].isChainValid());
console.log('Is Chain 6 Valid? ' + ABCcorp.ledgerList[5].isChainValid());
console.log('Is Chain 7 Valid? ' + ABCcorp.ledgerList[6].isChainValid());
console.log('Is Chain 8 Valid? ' + ABCcorp.ledgerList[7].isChainValid());
console.log('Is Chain 9 Valid? ' + ABCcorp.ledgerList[8].isChainValid());

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

// Indexes of most fraudulent and safest chains in Temporary Subsidiary Ledgers array
var maxIndex = ledgerDemerits.indexOf(Math.max(...ledgerDemerits));
var minIndex = ledgerDemerits.indexOf(Math.min(...ledgerDemerits));

// Ledger comparison results
console.log('Ledger Demerit Points: ' + ledgerDemerits);

// ----------------------------------------
// FRAUDULENT CHAIN OVERIDE

if (Math.max(...ledgerDemerits) !== 0) {
  console.log('Flagged Ledger: ' + maxIndex);

  // Fraudulent ledger contents pre-override
  console.log('\nOriginal Ledger: ');
  console.log(ABCcorp.ledgerList[maxIndex].viewContents());

  // Fraudulent ledger content override
  replaceContents(ABCcorp.ledgerList, maxIndex, minIndex);

  // Frudulent ledger contents post-override
  console.log('\nNew Ledger: ');
  console.log(ABCcorp.ledgerList[maxIndex].viewContents());
}

// ----------------------------------------
// LEDGER TESTING

// console.log(ABCcorp.ledgerList[2].viewContents());
