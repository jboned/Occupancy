import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollingModule, ScrollDispatcher } from '@angular/cdk/scrolling';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { AppRoutingModule } from './app-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { DragScrollModule } from 'ngx-drag-scroll';
import { MaphilightModule } from 'ng-maphilight'
import { ToastrModule } from 'ngx-toastr';
import { NgModule } from '@angular/core';

// ---------------------------- COMPONENTES APP ---------------------------- //
import { AppComponent } from './app.component';
import { HomeComponent,DialogKeys } from './home/home.component';
import { CreateAccountComponent,DialogDownload } from './create-account/create-account.component';
import { DragDropDirective } from './home/drag-drop.directive';
import { DatosComponent,IfChangesDirective,DialogPassword } from './datos/datos.component';
import { SuscribeComponent } from './suscribe/suscribe.component';


@NgModule({
  declarations: [
    AppComponent,
    DialogKeys,
    HomeComponent,
    DragDropDirective,
    CreateAccountComponent,
    DialogDownload,
    DatosComponent,
    SuscribeComponent,
    IfChangesDirective,
    DialogPassword
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatExpansionModule,
    MatGridListModule,
    MatDividerModule,
    MatCardModule,
    ScrollingModule,
    ToastrModule.forRoot(),
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    FormsModule, 
    ReactiveFormsModule,
    MatTableModule,
    FlexLayoutModule,
    HttpClientModule,
    MaphilightModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    DragScrollModule,
    MatTabsModule,
    MatTooltipModule
  ],
  providers: [ScrollDispatcher],
  bootstrap: [AppComponent]
})
export class AppModule { }
