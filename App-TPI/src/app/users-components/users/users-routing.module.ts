import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListUsersComponent } from './users-list-users/list-users.component';
import { NewUserComponent } from './users-new-user/new-user.component';
import { UsersUpdateUserComponent } from './users-update-user/users-update-user.component';

const routes: Routes = [
  {path: 'list', component: ListUsersComponent},
  {path: 'add' , component: NewUserComponent},
  {path: 'edit/:id', component: UsersUpdateUserComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
