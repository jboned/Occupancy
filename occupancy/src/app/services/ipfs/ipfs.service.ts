import { Injectable } from '@angular/core';
import * as IPFS from 'ipfs';

@Injectable({
  providedIn: 'root'
})
export class IPFSService {
  constructor() { }

  ipfs = null;
  async createOrGetIPFS(){
    if(!this.ipfs){
      this.ipfs = await IPFS.create()
    }
    return this.ipfs;
  }

}

