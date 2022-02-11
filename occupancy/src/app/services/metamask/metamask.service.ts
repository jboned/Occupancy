import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import Web3 from "web3";
import * as sigs from "eth-sig-util";
const abi = require('./abi');

declare let window: any;
declare let ethereum: any;
let web3: Web3;

@Injectable({
  providedIn: 'root'
})
export class MetamaskService {
  constructor(
    private apiService: ApiService
  ) { }
  contract;
  ipfs;
  
  initWeb3(){
    web3 = new Web3(window.ethereum); 
    this.contract = new web3.eth.Contract(abi.abi_contract.abi, abi.abi_address);
  }
  
  async getAccount(){
    let accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    let account = web3.utils.toChecksumAddress(accounts[0]);
    return account;
  }

  async genAndSignData(account: string){
    let params = this.makemsg(account);
    let res = await ethereum.send({
      method: 'eth_signTypedData',
      params: [params, account],
      from: account
    },function (err: any, result: any) { 
      if (err){ 
        return JSON.stringify({"error":err})
      }else if (result.error){
        return JSON.stringify({"error":result.error.message})
      }else{
        const recover = web3.utils.toChecksumAddress(
          sigs.recoverTypedSignatureLegacy({
            data: params,
            sig: result.result 
          })
        );
        return JSON.stringify({"res":recover});
      }
    })
    return res;
  }

  async sendTransaction(to:String,from:String,value:number){
    let value_ = Math.round(value * 1e12) / 1e12;
    const transactionParameters = {
      to: to,
      from: from,
      value: Web3.utils.toWei(value_.toString(),'ether'),
      chainId: '0x5', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
    };

    try{
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      return JSON.stringify({"hash":txHash});
    }catch(err){
      console.log(err)
      return JSON.stringify({"error":err.message});
    }
  }

  async getRestaurantsZone(zone){  
      let result  = []; 
      let res_ids = [];
      await this.contract.methods.get_restaurant_by_zone(zone).call( (err, res_list) => {
        if (err) {
          return JSON.stringify({"error":err});
        }
        res_ids=res_list
      });
      for(let i=0;i<res_ids.length;i++){
        await this.contract.methods.get_restaurant_data(res_ids[i]).call( (err, res) => {
          if (err) {
            return JSON.stringify({"error":err});
          }
          let restaurante = {};
          restaurante["id"] = res_ids[i];
          restaurante["ipfs"] = res._ipfs;
          restaurante["cost"] = res._cost;
          result.push(restaurante);
        })
      }
      return result;
  }

  async subscribeRestaurants(params){
    let address = params["address"];
    let enc_key = params["keys"]["root-"+address+".pub"];
    let sig_key = params["keys"]["signing-"+address+".pub"];
    let value = params["value"];
    let id = params["id"];
    let result;
    await this.contract.methods.subscribe(enc_key,sig_key,id).send({from:address,value:value}, (err,res) => {
      if (err) {
        result =  JSON.stringify({"error":err});
      }else{
        result = JSON.stringify({"ok":"ok"});
      }
    });
    return result;

    
  }


  makemsg(account:String) {
    var text_random           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 15; i++ ) {
      text_random += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    let text = "This is a challenge created by Occupancy for address "+ account +" to prove private key ownership by signing this random data with it: " + text_random;         
    const params = [{
        type: 'string', 
        name: 'Mensaje:',
        value: text
    }]
    return params
  }
}

