import { animate, state, style, transition, trigger } from '@angular/animations';
import { chainedInstruction } from '@angular/compiler/src/render3/view/util';
import { Component, Directive, Inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api/api.service';
import { MetamaskService } from '../services/metamask/metamask.service';
//const StreamrClient = require('streamr-client')

declare var $ : any
declare var window : any
declare var StreamrClient : any

@Directive({
  selector: '[ifChanges]'
})
export class IfChangesDirective {
  private currentValue: any;
  private hasView = false;

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<any>
  ) { }

  @Input() set ifChanges(val: any) {
    if (!this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (val !== this.currentValue) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.currentValue = val;
    }
  }
}


@Component({
  selector: 'app-datos',
  templateUrl: './datos.component.html',
  styleUrls: ['./datos.component.css'],
  animations: [
    trigger('myTrigger', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', [animate('0.5s 0.5s ease-in')]),
      transition('* => void', [animate('0.5s ease-in')])
    ]),
  ]
})
export class DatosComponent implements OnInit {
  constructor(
    private toastr: ToastrService,
    private metamaskService: MetamaskService,
    private apiService: ApiService,
    public dialog: MatDialog,
    private router: Router, 
  ) {}
  account: string;
  alias: string;
  password: string;
  ok = false;
  now = null;

  data = {}; 
  subscriptions = []; 
  restaurantsByArea = {};
  areas = [];

  client = new StreamrClient({
    auth: {
      privateKey: "91c06e68cc18ec5a7dba096d6c670c2b96853a243f107ee16edff5ce0261bd8d"
    }
  })
  
  
  async ngOnInit() {
    this.account = await this.metamaskService.getAccount();
    this.data = JSON.parse(localStorage.getItem(this.account));
    this.alias = this.data["alias"];
    this.subscriptions = this.checkSubscriptions(this.data["subscriptions"])
    this.restaurantsByArea = this.groupBy(this.subscriptions, 'zone')
    this.areas = Object.keys(this.restaurantsByArea);
    this.now = Date.now();
    let dialogPassword = this.dialog.open(DialogPassword,{
      restoreFocus: false,
      disableClose:true,
      hasBackdrop:true
     });
     dialogPassword.afterClosed().subscribe(result => {
      this.ok = true;
      this.password = result;
      let params = {
        "address" : this.account,
        "keys"    : this.data["keys"],
        "password": this.password
      }
      
      for(let i = 0; i< this.subscriptions.length;i++){
        let res = this.subscriptions[i];
        this.client.subscribe({
            stream: res.streamr,
            resend: { last: 1 }
        },(message) => { 
          try{
            params["enrico_key"] = message.enrico;
            params["ciphertext"] = message.ciphertext;
            params["policy_key"] = res.policy_pubkey;
            params["alice_pubkey"] = res.alice_key;
            params["label"] = res.label;  
            this.apiService.retrieve(params).then(sub_data => {
                let result = JSON.parse(sub_data as string);
                let res_zona = this.restaurantsByArea[res["zone"]].find(el => el.id == res["id"]);
                res_zona["percent"] = result["percent"]
                res_zona["total_occupancy"] = result["total_occupancy"]
                res_zona["now_occupancy"] = result["now_occupancy"]
                res_zona["timestamp"] = new Date(result["timestamp"]).toLocaleString()
                res_zona["loaded"] = true;
            });     
          }catch(error){
            this.toastr.error(error.message,"Error",{
              positionClass:'toast-top-center', 
              progressBar:true,
              timeOut:3000
            });
          }
        });
      }
    });
  }

  checkSubscriptions(subscriptions){
    let result = subscriptions.filter( el => (this.now - el.subscribed)/ 1000 / 60 / 60 / 24 < 7);
    return result;
  }

  toDays(timestamp){
    return Math.round(7 - (this.now - timestamp) / 1000 / 60 / 60 / 24);
  }

  groupBy(xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }
  
  subscribe(){
    this.router.navigateByUrl('/subscribe', { state: { account: this.account, password:this.password } });
  }
  
}

@Component({
  selector: 'dialog-password',
  templateUrl: 'dialog-password.html'
})
export class DialogPassword {

  passwordForm: FormGroup | undefined;
  hide = true;



  constructor(
    public passwordDialog: MatDialogRef<DialogPassword>,
    fb: FormBuilder
  ) { 
    this.passwordForm = fb.group({
      password: ['', [Validators.required, Validators.pattern('^([a-zA-Z0-9@-_]{8,})$')]],
      confirmPassword: ['', Validators.required]
    },{  validator: ValidatePassword.MatchPassword });
    
  }

  guardarPassword(){
    let password = this.passwordForm.controls.password.value;
    this.passwordDialog.close(password);
  }


}

export class ValidatePassword {
  static MatchPassword(abstractControl: AbstractControl) {
    let password = abstractControl.get('password').value;
    let confirmPassword = abstractControl.get('confirmPassword').value;
     if (password != confirmPassword) {
         abstractControl.get('confirmPassword').setErrors({
           MatchPassword: true
         })
    } else {
      return null
    }
  }
}

