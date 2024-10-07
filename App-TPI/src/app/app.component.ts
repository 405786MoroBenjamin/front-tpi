import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./login/login.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { LandingPageComponent } from "./landing-page/landing-page.component";
import { NewUserComponent } from './new-user/new-user.component';
import { ListUsersComponent } from './list-users/list-users.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent, NavbarComponent, LandingPageComponent, NewUserComponent, ListUsersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'LoginTpi';
  showLoginPage : boolean = false;
  showLandingPage : boolean = false;
  showAddUserPage : boolean = false;
  showListUsersPage : boolean = false;

  redirect(page : any){
    this.showLandingPage = false;
    this.showLoginPage = false;
    this.showAddUserPage = false;
    this.showListUsersPage = false;

    if(page == "Login"){
      this.showLoginPage = !this.showLoginPage;
    }
    if(page == "Landing"){
      this.showLandingPage = !this.showLandingPage;
    }
    if(page == "ListUsers"){
      this.showListUsersPage = !this.showListUsersPage;
    }
    if(page == "AddUser"){
      this.showAddUserPage = !this.showAddUserPage;
    }
  }
}
