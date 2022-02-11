import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { DatosComponent } from './datos/datos.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { SuscribeComponent } from './suscribe/suscribe.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'create-account',component: CreateAccountComponent},
  { path: 'data',component: DatosComponent},
  { path: 'subscribe',component: SuscribeComponent}

]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
