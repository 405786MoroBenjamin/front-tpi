import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { OwnerTypeModel } from '../users-models/owner/OwnerType';
import { Observable } from 'rxjs';
import { OwnerStateModel } from '../users-models/owner/OwnerState';
import { OwnerModel } from '../users-models/owner/PostOwnerDto';
import { Owner } from '../users-models/owner/Owner';
import { PutOwnerDto } from '../users-models/owner/PutOwnerDto';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly url = 'http://localhost:8081/';

  constructor() { }

  getAll(): Observable<Owner[]>{
    return this.http.get<Owner[]>(this.url + 'owners');
  }

  getById(id : number): Observable<Owner>{
    return this.http.get<Owner>(this.url + 'owners/' + id);
  }

  getAllTypes(): Observable<OwnerTypeModel[]>{
    return this.http.get<OwnerTypeModel[]>(this.url + 'owners/ownertypes');
  }
  
  getAllStates(): Observable<OwnerStateModel[]>{
    return this.http.get<OwnerStateModel[]>(this.url + 'owners/taxstatus');
  }

  postOwner(owner: OwnerModel): Observable<OwnerModel>{
    const formData: FormData = new FormData();
    formData.append('name', owner.name);
    formData.append('lastname', owner.lastname);
    formData.append('dni', owner.dni);
    formData.append('cuitCuil', owner.cuitCuil);
    formData.append('dateBirth', new Date(owner.dateBirth).toISOString().split('T')[0]);
    formData.append('ownerTypeId', owner.ownerTypeId.toString());
    formData.append('taxStatusId', owner.taxStatusId.toString());
    formData.append('businessName', owner.businessName? owner.businessName : '');
    formData.append('active', owner.active.toString());
    formData.append('username', owner.username);
    formData.append('password', owner.password);
    formData.append('email', owner.email);
    formData.append('phoneNumber', owner.phoneNumber);
    formData.append('avatarUrl', owner.avatarUrl);
    formData.append('roles', JSON.stringify(owner.roles));
    formData.append('userCreateId', owner.userCreateId.toString());
    formData.append('plotId', owner.plotId.toString());
    formData.append('telegramId', owner.telegramId.toString());
    owner.files.forEach((file, index) => {
      formData.append('files', file);
    });
    return this.http.post<OwnerModel>(this.url + 'owners', formData,{
      headers: {
      }
    });
  }
  
  putOwner(owner: PutOwnerDto, ownerId : number): Observable<OwnerModel>{
    return this.http.put<OwnerModel>(this.url + `owners/${ownerId}`, owner)
  }
}
