import { Component, OnInit,NgZone, Inject, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ApiService } from '../services/api/api.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MetamaskService } from '../services/metamask/metamask.service';
import { IPFSService } from '../services/ipfs/ipfs.service';
import { DragScrollComponent } from 'ngx-drag-scroll';
import { MatExpansionPanel } from '@angular/material/expansion';
import { animate, style, transition, trigger } from '@angular/animations';
declare let Dropbox:any;
declare var $ : any

const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate(1000, style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate(1000, style({ opacity: 0 }))
  ])
])

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css'],
  animations: [fadeInOut]
})
export class CreateAccountComponent implements OnInit {
  
  hide = true;
  account = "";
  config = {};
  noRestaurants = true;
  createForm: FormGroup | undefined;
  dataSource : MatTableDataSource<any>; 

  res: any[] = []; 
  selectedAreas: any[] = []; 
  showedRestaurants = [];
  @ViewChild('nav', {read: DragScrollComponent}) ds: DragScrollComponent;
  @ViewChild('exp', {read: MatExpansionPanel}) expansion: MatExpansionPanel; 


  constructor(
    private metamaskService: MetamaskService,
    private ipfsService: IPFSService,
    private apiService: ApiService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private router: Router,  
    fb: FormBuilder
  ){ 
    this.createForm = fb.group({
      alias: new FormControl('', [
        Validators.required,
        Validators.pattern('^([a-zA-Z0-9@-_]{0,15})$')
      ]),
      password: new FormControl('',[
        Validators.required,
        Validators.pattern('^([a-zA-Z0-9@-_]{8,})$')
      ])
    });    
    let params_query = this.router.getCurrentNavigation().extras.state;
    if( params_query == undefined){
      this.router.navigateByUrl('/home');
    }else{
      this.account = params_query.account;
    }
  }
 
  ngOnInit(): void {

    this.config = {
      fade: true,
      alwaysOn: false,
      neverOn: false,

      // fill
      fill: true,
      fillColor: '#ffffff',
      fillOpacity: 0.4,

      // stroke
      stroke: true,
      strokeColor: '#4d0ec0',
      strokeOpacity: 1,
      strokeWidth: 1,

      // shadow:
      shadow: true,
      shadowColor: '#000000',
      shadowOpacity: 0.8,
      shadowRadius: 10
    }   
    this.dataSource = new MatTableDataSource(this.res);
    this.res[0] = {};
    this.dataSource.filteredData = [];
  }
  
  async selectArea(el){
    var data = $(el).mouseout().data('maphilight') || {};
    data.alwaysOn = !data.alwaysOn;
    $(el).data('maphilight', data).trigger('alwaysOn.maphilight');
    let zona = $(el).attr("name");
    if(data.alwaysOn){ 
      this.selectedAreas.push(zona); 
      const esta = this.res[0][zona];
      if(esta == null){
        this.res[0][zona] = [];   
        let restaurantes = await this.metamaskService.getRestaurantsZone(zona);
        let ipfs = await this.ipfsService.createOrGetIPFS();
        for(let i = 0; i < restaurantes.length;i++){
          const stream = ipfs.cat(restaurantes[i]["ipfs"]);
          let dataresult = ''
          for await (const chunk of stream) {
            dataresult += chunk.toString()
          }
          let res_json = JSON.parse(dataresult);
          let tmp = {}; tmp["selected"] = false; tmp["id"] = restaurantes[i]["id"];
          res_json.forEach(function(el){  tmp[el["name"]] = el["value"]; });
          this.res[0][zona].push(tmp);
        }
      } 
    }else{
      this.res[0][zona].map(element => element.selected = false);
      this.selectedAreas = this.selectedAreas.filter(item => item !== zona)
    }  
    this.filterSelectedAreas();
    if(this.selectedAreas.length > 0){
      this.expansion.open();
      this.noRestaurants = false;
    }else{
      this.expansion.close();
      this.noRestaurants = true;
    }
  }

  filterSelectedAreas(){
    let lista_total = [];
    for(var i =0; i< this.selectedAreas.length;i++){
      let zona = this.selectedAreas[i];
      let lista = this.res[0][zona];
      lista_total.push(...lista);
    }
    this.showedRestaurants = lista_total;
    this.dataSource.filteredData =  this.showedRestaurants;
  }

  applyFilter(event: Event) {
    let filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filteredData = this.showedRestaurants.filter(element => element.name.toLowerCase().includes(filterValue));
  }

  selectButton(id:Number, zona:string){;
    let el = this.res[0][zona].find(el => el.id == id);
    el.selected==true ? el.selected = false : el.selected = true; 
  } 

  moveLeft() {
    this.ds.moveLeft();
  }
 
  moveRight() {
    this.ds.moveRight();
  }
  
  getSelectedRestaurants(){
    let selectedRestaurants = [];
    for(var i =0; i< this.selectedAreas.length;i++){
      let area = this.selectedAreas[i];
      let list = this.res[0][area].filter(element => element.selected)
      selectedRestaurants.push(...list);
    }
    return selectedRestaurants;
  }

  loading = false;  
  creatingKeys = false;
  creatingPolicies = false;

  async createAccount(){  
    window.scroll(0,0); 
    this.loading = true;
    let subscriptions = [];
    let params = {
      "password":this.createForm.controls.password.value,
      "alias": this.createForm.controls.alias.value,
      "address":this.account
    }
    try{
      this.creatingKeys = true;
      let data = await this.apiService.createKeys(params).toPromise() as string;
      let keys = JSON.parse(data);
      params["keys"] = keys["keys"];
      this.creatingKeys = false;
    }catch(error){
      this.toastr.error(error.message,"Error",{
        positionClass:'toast-top-center', 
        progressBar:true,
        timeOut:3000
      });
      this.loading = false;
    }   
    if(params["keys"]){
      let selectedRestaurants = this.getSelectedRestaurants();
      this.creatingPolicies=true;
      for(let i = 0; i< selectedRestaurants.length; i++){
        let el = selectedRestaurants[i];
        delete el.selected;
        let params_subscribe = JSON.parse(JSON.stringify(params));     
        params_subscribe["id"] = el.id;
        params_subscribe["value"] = el.cost;
        try{
          await this.metamaskService.subscribeRestaurants(params_subscribe);
          await new Promise(r => setTimeout(r, 10000));
          /* 
          params_subscribe["alice_pubkey"] = el.alice_key; 
          params_subscribe["label"] = el.label;
          await this.apiService.joinPolicy(params_subscribe).toPromise();
          */
          el["subscribed"] = Date.now();
          subscriptions.push(el);
        }catch(error){
          this.toastr.error(error.message,"Error",{
            positionClass:'toast-top-center', 
            progressBar:true,
            timeOut:3000
          });
          this.loading = false;
        }
      } 
      this.creatingPolicies=false;
      delete params["password"];  
      params["subscriptions"] = subscriptions;  
      let data = JSON.stringify(params)     
      localStorage.setItem(this.account,data);
      this.loading = false;
      let dialog = this.dialog.open(DialogDownload,{
        width: "80%",
        height:"60%",
        disableClose:true,
        data: {
          json:data
        }
      });
      dialog.disableClose = true;
      dialog.afterClosed().subscribe(result => {
        this.router.navigateByUrl('/data');
      });
    }
  }
}

@Component({
  selector: 'dialog-download',
  templateUrl: 'dialog-download.html',
})
export class DialogDownload implements OnInit{
  downloadJsonHref:SafeUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService
  ) { } 

  ngOnInit(){  
      let json = this.data.json;
      let url = "data:text/json;charset=UTF-8," + encodeURIComponent(json);
      var uri = this.sanitizer.bypassSecurityTrustUrl(url);
      this.downloadJsonHref = uri;
      let toast = this.toastr;
      var options = {  
        success: function () {
          toast.success("Archivo subido a Dropbox correctamente.","Operación completada.",{
            positionClass:'toast-top-center', 
            progressBar:true,
            timeOut:3000
          });
        },
        error: function (errorMessage:any) {
          toast.error(errorMessage,"Error",{
            positionClass:'toast-top-center',
            progressBar:true,
            timeOut:3000
          });
        }
    };
    var button = Dropbox.createSaveButton(url, 'keys_occupancy.json', options);
    document.getElementById("cont-drop").appendChild(button);
  }
}