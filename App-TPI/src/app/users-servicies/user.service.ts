import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserGet } from '../users-models/users/UserGet';
import { RolModel } from '../users-models/users/Rol';
import { UserPost } from '../users-models/users/UserPost';
import { LoginUser } from '../users-models/users/Login';
import { UserPut } from '../users-models/users/UserPut';
import { map } from 'rxjs/operators';
import { DeleteUser } from '../users-models/owner/DeleteUser';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly url = 'http://localhost:9060/users/';

  constructor() { }

  putUser(user: UserPut, userId: number): Observable<UserPut> {
    return this.http.put<UserPut>(this.url + "put/" + userId, user);
  }

  postUser(user: UserPost): Observable<UserGet> {    
    return this.http.post<UserGet>(this.url + "post", user);
  } 

  getAllUsers(): Observable<UserGet[]> {
    return this.http.get<UserGet[]>(this.url + "getall");
  }

  verifyLogin(user: LoginUser): Observable<LoginUser> {
    return this.http.post<LoginUser>("http://localhost:9060/auth/login", user);
  }   

  getAllRoles(): Observable<RolModel[]> {
    return this.http.get<RolModel[]>("http://localhost:9060/roles");
  }

  getUserById(userId: number): Observable<UserGet> {
    return this.http.get<UserGet>(this.url + "getById/" + userId);
  }

  getUserByEmail(email: string): Observable<UserGet> {
    return this.http.get<UserGet>(this.url + "getByEmail/" + email);
  }

  getUsersByPlotID(plotId: number): Observable<UserGet[]> {
    return this.http.get<UserGet[]>(this.url + "getall/" + plotId);
  }

  deleteUser( user: DeleteUser): Observable<any> {
    return this.http.delete(this.url + 'delete/' + user.id + '/' + user.userIdUpdate); 
  }
}
