import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  url:string
  constructor(private http: HttpClient) { 
    this.url = "https://occupancyapi.hopto.org/bob/";
  }
  createKeys(params: any){
      let headers = new HttpHeaders().set('Content-Type','application/json');
      return this.http.post(this.url+'create-keys', params, {headers: headers}).pipe();
  }

  joinPolicy(params: any){
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this.http.post(this.url+'join-policy', params, {headers: headers}).pipe();
  }

  retrieve(params: any){
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this.http.post(this.url+'retrieve', params, {headers: headers}).toPromise();
  }

}

