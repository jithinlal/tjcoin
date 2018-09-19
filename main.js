const SHA256 = require('crypto-js/sha256');

class Transaction {
	constructor(fromAddress, toAddress, amount) {
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}
}

class Block {
	constructor(timestamp, transactions, previousHash = '') {
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.previousHash = previousHash;
		this.hash = this.calculateHash();
		this.nonce = 0;
	}

	calculateHash() {
		return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce)
			.toString();
	}

	mineBlock(difficulty) {
		while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
			this.nonce++;
			this.hash = this.calculateHash();
		}
		console.log('Block mined : ', this.hash);
	}
}

class BlockChain {
	constructor() {
		this.chain = [this.createGenesisBlock()];
		this.difficulty = 3;
		this.pendingTransactions = [];
		this.miningReward = 100;
	}

	createGenesisBlock() {
		return new Block("01/01/2018", "Genesis Block", "0");
	}

	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	minePendingTransactions(miningRewardAddress) {
		/*
		 *	actually it is the miners choice which to choose
		 *	and which to abort
		 */
		let block = new Block(Date.now(), this.pendingTransactions);
		block.mineBlock(this.difficulty);
		console.log('Block successfully mined!');
		this.chain.push(block);

		this.pendingTransactions = [
			new Transaction(null, miningRewardAddress, this.miningReward)
		];
	}

	createTransaction(transaction) {
		this.pendingTransactions.push(transaction);
	}

	getBalanceOfAddress(address) {
		let balance = 0;
		for (const block of this.chain) {
			for (const trans of block.transactions) {
				if (trans.fromAddress === address) {
					balance -= trans.amount;
				}

				if (trans.toAddress === address) {
					balance += trans.amount;
				}
			}
		}

		return balance;
	}

	isChainValid() {
		for (let i = 1; i < this.chain.length; i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i - 1];

			if (currentBlock.hash !== currentBlock.calculateHash()) {
				return false;
			}

			if (currentBlock.previousHash !== previousBlock.hash) {
				return false;
			}
		}

		return true;
	}
}

let tjcoin = new BlockChain();

tjcoin.createTransaction(new Transaction('address1', 'address2', 100));
tjcoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('Starting the miner...');
tjcoin.minePendingTransactions('tj-address');
console.log('Balance1 : ', tjcoin.getBalanceOfAddress('tj-address'));
tjcoin.minePendingTransactions('tj-address');
console.log('Balance2 : ', tjcoin.getBalanceOfAddress('tj-address'));

// console.log('Mining block 1...');
// tjcoin.addBlock(new Block(1, '01/02/2018', {
// 	amount: 4
// }));
// console.log('Mining block 2...');
// tjcoin.addBlock(new Block(2, '01/03/2018', {
// 	amount: 8
// }));

// console.log('Is our chain valid? ', tjcoin.isChainValid());

// tjcoin.chain[1].data = {
// 	amount: 100
// };

// console.log('Is our chain valid? ', tjcoin.isChainValid());

// console.log(JSON.stringify(tjcoin, null, 4));