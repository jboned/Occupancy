import { Component, OnInit, ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatTableDataSource } from '@angular/material/table';
import { DragScrollComponent } from 'ngx-drag-scroll';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api/api.service';
import { IPFSService } from '../services/ipfs/ipfs.service';
import { MetamaskService } from '../services/metamask/metamask.service';
import { DialogDownload } from '../create-account/create-account.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
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
  selector: 'app-suscribe',
  templateUrl: './suscribe.component.html',
  styleUrls: ['./suscribe.component.css']
})
export class SuscribeComponent implements OnInit {

  account = null;
  password = null;
  data = null;
  config = {};
  noRestaurants = true;
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
    private router: Router
  ) { 
    let params_query = this.router.getCurrentNavigation().extras.state;
    if( params_query == undefined){
      this.router.navigateByUrl('/home');
    }else{
      this.account = params_query.account;
      this.password = params_query.password;
    }
  }

  ngOnInit(): void {
    this.data = JSON.parse(localStorage.getItem(this.account));
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
    if(data.alwaysOn){ // Si se ha seleccionado.
      this.selectedAreas.push(zona); 
      const is = this.res[0][zona];
      if(!is){
        this.res[0][zona] = [];   
        let restaurants = await this.metamaskService.getRestaurantsZone(zona);
        let ipfs = await this.ipfsService.createOrGetIPFS();
        for(let i = 0; i < restaurants.length;i++){
          if(!this.data["subscriptions"].some(el => el.id == restaurants[i]["id"])){
            const stream = ipfs.cat(restaurants[i]["ipfs"]);
            let dataresult = ''
            for await (const chunk of stream) {
              dataresult += chunk.toString()
            }
            let res_json = JSON.parse(dataresult);
            let tmp = {}; 
            tmp["selected"] = false; 
            tmp["id"] = restaurants[i]["id"];
            res_json.forEach(el => tmp[el["name"]] = el["value"]);
            this.res[0][zona].push(tmp);
          }
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
      let zona = this.selectedAreas[i];
      let lista = this.res[0][zona].filter(element => element.selected)
      selectedRestaurants.push(...lista);
    }
    return selectedRestaurants;
  }

  loading = false;  

  async subscribe(){  
    window.scroll(0,0); 
    this.loading = true;
    let subscriptions = this.data["subscriptions"];
    let params = {
      "password":this.password,
      "address":this.account
    }
    let selectedRestaurants = this.getSelectedRestaurants();
    for(let i = 0; i< selectedRestaurants.length; i++){
      let el = selectedRestaurants[i];
      delete el.selected;
      let params_subscribe = JSON.parse(JSON.stringify(params));     
      params["id"] = el.id;
      params["value"] = el.cost;
      try{
        await this.metamaskService.subscribeRestaurants(params_subscribe);
        params_subscribe["alice_pubkey"] = el.alice_key; 
        params_subscribe["label"] = el.label; 
        await this.apiService.joinPolicy(params_subscribe).toPromise();
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
    delete params["password"];  
    this.data["subscriptions"] = subscriptions;
    let data_string = JSON.stringify(this.data)   
    localStorage.setItem(this.account,data_string);
    this.loading = false;
    let dialog = this.dialog.open(DialogDownload,{
      width: "80%",
      height:"60%",
      disableClose:true,
      data: {
        json:data_string
      }
    });
    dialog.disableClose = true;
    dialog.afterClosed().subscribe(result => {
      this.router.navigateByUrl('/data');
    });
  }


}
