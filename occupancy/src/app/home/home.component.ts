import { MetamaskService } from '../services/metamask/metamask.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as AOS from 'aos';
import { IPFSService } from '../services/ipfs/ipfs.service';
declare let window: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  constructor(
    private toastr: ToastrService,
    private metamaskService: MetamaskService,
    public dialog: MatDialog,
    private router: Router, 
  ){
    AOS.init();
  }

  ngOnInit(){ }
  
  signed = false;
  async login(){ 
    if (typeof window.ethereum != undefined){
      this.metamaskService.initWeb3();
      let account = await this.metamaskService.getAccount();
      if(account == undefined || this.signed == false){
        account = await this.metamaskService.getAccount();
        let res = JSON.parse(await this.metamaskService.genAndSignData(account));
        if (res["error"]){ 
          this.toastr.error(res["error"].message,"Error",{
            positionClass:'toast-top-center',
            progressBar:true,
            timeOut:3000
          });
        }
        if (res["res"]){
          if(res["res"] === account){
            if(!localStorage.getItem(account)){
              //No tenemos usuario.
              this.dialog.open(DialogKeys,{
                restoreFocus: false,
                disableClose:true,
                data: {
                  account: account 
                }
               });
            }else{
              //Tenemos usuario.
              this.toastr.success("We have found your user in the application.", "Welcome.",{
                positionClass:'toast-top-center', 
                progressBar:true,
                timeOut:2000
              }).onHidden.subscribe(res => this.router.navigateByUrl('/data'));
              this.signed = true;
            }
          }else{
            this.toastr.error("Wrong signature","Error",{
              positionClass:'toast-top-center', 
              progressBar:true,
              timeOut:3000
            });
          }
        }
      }
    }else{
      this.toastr.error("Please, use a browser with Metamask installed. ","Error",{
        positionClass:'toast-top-center',
        progressBar:true,
        timeOut:3000
      });
    }
  } 


}

@Component({
  selector: 'dialog-keys',
  templateUrl: 'dialog-keys.html',
  styleUrls: ['dialog-keys.css']
})
export class DialogKeys {

  fileString: string | undefined;
  file: File | undefined;
  

  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService,
    private router: Router,  
  ) { }

  uploadFileDragDrop(event:FileList) {
      const element = event[0];
      this.file = element;
  }

  uploadFileManual(event:Event){
    let fs = ((event.target as HTMLInputElement).files) as FileList;
    const element = fs[0];
    this.file = element;
  }

  deleteAttachment() {
    this.file = undefined;
  }

  checkFile(){
    var reader = new FileReader(); // File reader to read the file 
    let fil = this.file as File;
    reader.onloadend = () => {
      this.fileString = reader.result as string;
      let file_json = JSON.parse(this.fileString);
    
      let correct = true;
      file_json["address"] != this.data["account"] ? correct = false : {}
      Object.keys(file_json["keys"]).forEach(el => { el.includes(this.data["account"]) ? {} : correct = false });
      if(correct){
        localStorage.setItem(this.data["account"],this.fileString);
        this.toastr.success("The keys have been checked correctly", "Welcome back",{
          positionClass:'toast-top-center', 
          progressBar:true,
          timeOut:2000
        }).onHidden.subscribe(res => this.router.navigateByUrl('/data'));
      }else{
        this.toastr.error("Entered keys do not belong to your account.","Error",{
          positionClass:'toast-top-center', 
          progressBar:true,
          timeOut:3000
        });
      }
      this.dialog.closeAll();
    };

    reader.readAsText(fil); // Read the uploaded file
  }

  irCrearCuenta(){
    if (this.data["account"]){
      this.router.navigateByUrl('/create-account', { state: { account: this.data["account"] } });
    }
  }  


}
