import axios from 'axios';
import { Wallet } from '@/services/Wallets/Wallet.js';
import configs from '@/configs';
import { StringHelper } from '@/services/helper';
import { TokenERC20 } from '@/services/Wallets/Tokens/TokenERC20.js';

const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');
const hdkey = require('hdkey');
const ethUtil = require('ethereumjs-util');
const bip39 = require('bip39');

const BN = Web3.utils.BN;
const compiled = require('@/contracts/Dadken.json');
var erc20Abi = compiled.abi;

export class Dadken extends TokenERC20 {

    constructor() {
      super();      
      this.name = 'SHURI';
      this.title = 'Shuriken';
      this.className = 'Shuriken';
      this.customToken = false; // autonomous add.      
    }
    async getBalance(){
      const web3 = this.getWeb3();      
      let contract = new web3.eth.Contract(   
        erc20Abi,     
        configs.network[this.chainId].shurikenTokenAddress,
      );
      
      let balance = await contract.methods.balanceOf(this.address).call();                
      return Web3.utils.fromWei(balance.toString());

    }

    async transfer(toAddress, amountToSend){
      this.contractAddress = configs.network[this.chainId].shurikenTokenAddress;
      return super.transfer(toAddress, amountToSend);
    }
    
}

export default { Shuriken };