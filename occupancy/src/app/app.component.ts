import { Component, NgZone, OnInit } from '@angular/core';
import { ScrollDispatcher } from "@angular/cdk/overlay";
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
declare let window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {
  
  title = 'occupancy';
  isOnTop = true;
  mobile = false;

  constructor(
    private scrollDispatcher: ScrollDispatcher,
    private toastr: ToastrService,
    private zone: NgZone,
    private router: Router
  ) {}
    
  ngOnInit(){
    this.scrollDispatcher.scrolled().subscribe(event => {
      if(this.router.url == "/home"){
        const scroll = window.scrollY;
        let newIsOnTop = this.isOnTop;
        if (scroll > 0) {
          newIsOnTop = false;
        } else {
          newIsOnTop = true;
        }
        if (newIsOnTop !== this.isOnTop) {
          this.zone.run(() => {
            this.isOnTop = newIsOnTop;
          });
        }
      }
    });
  }

  logout(){
    localStorage.clear();
    this.toastr.success("Thank you for using Occupancy.","Logout success.",{
      positionClass:'toast-top-center', 
      progressBar:true,
      timeOut:2000
    }).onHidden.subscribe(res => this.router.navigateByUrl('/home'));
  }

}