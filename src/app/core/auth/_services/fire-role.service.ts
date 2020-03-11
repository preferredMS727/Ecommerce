import { Injectable } from '@angular/core';
import { Role } from '../_models/role.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseRole } from '../../../_shared/models/firebase-role.model';
import { of, Observable, observable, from } from 'rxjs';
import { map, catchError, mergeMap, tap, mapTo } from 'rxjs/operators';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../_base/crud';
const API_ROLES_URL = 'api/roles';
@Injectable({
  providedIn: 'root'
})
export class FireRoleService {
  public totalRoleCounter = 0;
  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private httpUtils: HttpUtilsService,

  ) { }

  // Roles
  getAllRoles(): Observable<Role[]> {
    let _roles: Role[] = [];
    return this.firestore.collection('roles').valueChanges().pipe(
      map((response: any[]) => {
        response.map((res) => {
          let tempRole = new Role()
          tempRole.clear();
          Object.assign(tempRole, res);
          _roles.push(tempRole);
          // console.log('orginal roles from firebase: ', _roles)
        })
      }),
      mapTo(_roles)
    )
    console.log('this all roles: ', _roles)
    return this.http.get<Role[]>(API_ROLES_URL);
  }

  createRole(_role: Role): Observable<Role> {
    let newRole = new Role();
    newRole.clear();

    const firebaseRole: FirebaseRole = {
      _isEditMode: _role._isEditMode,
      _userId: _role._userId,
      _createdDate: _role._createdDate === undefined ? null : '',
      _updatedDate: _role._updatedDate === undefined ? null : '',
      id: this.totalRoleCounter + 1,
      title: _role.title,
      permissions: _role.permissions,
      isCoreRole: _role.isCoreRole
    }

    const subscription = from(this.firestore.collection('roles').add(firebaseRole)).pipe(
      map((res) => {
        Object.assign(newRole, firebaseRole);
        console.log('new role is added in firebase: ', newRole)
        return newRole
      })
      // catchError((err: any, caught: Observable<Role>) => {
      //   return newRole
      // })
    )

    return subscription;
  }

  findRoles(queryParams: QueryParamsModel): Observable<QueryResultsModel> {

    return this.firestore.collection('roles').valueChanges().pipe(
      mergeMap((res: Role[]) => {
        const result: QueryResultsModel = this.httpUtils.baseFilter(res, queryParams, []);
        this.totalRoleCounter = result.totalCount;
        console.log('Find Roles works normally: ', result);
        return of(result);
      })
    )

    // this.firestore.collection('roles').get().subscribe(res => {
    //   console.log('firebase querypara----1-1-1-1-1-1-', res);
    // })
  }

  updateRole(_role: Role): Observable<any> {
    const firebaseRole: FirebaseRole = {
      _isEditMode: _role._isEditMode,
      _userId: _role._userId,
      _createdDate: _role._createdDate === undefined ? null : '',
      _updatedDate: _role._updatedDate === undefined ? null : '',
      id: _role.id,
      title: _role.title,
      permissions: _role.permissions,
      isCoreRole: _role.isCoreRole
    }

    this.firestore.collection('roles', ref => ref.where('id', '==', _role.id)).get().toPromise()
      .then((res) => {
        const uid = res.docs[0].id;
        this.firestore.collection('roles').doc(uid).update(firebaseRole)
      })

    return of(firebaseRole);

    // return this.firestore.collection('roles', ref => ref.where('id', '==', _role.id)).snapshotChanges().pipe(
    //   tap((res) => {
    //     console.log('update role uid ----: ', res)
    //     const uid = res[0]['payload'].doc.id;
    //     this.firestore.collection('roles').doc(uid).update(firebaseRole)
    //   })
    // )
  }

  // DELETE => delete the role from the server
  deleteRole(roleId: number): Observable<any> {
    this.firestore.collection('roles', ref => ref.where('id', '==', roleId)).get().toPromise()
      .then((res) => {
        const uid = res.docs[0].id;
        this.firestore.collection('roles').doc(uid).delete();
      })

    return of(roleId)
    // return this.firestore.collection('roles', ref => ref.where('id', '==', roleId)).snapshotChanges().pipe(
    //   tap((res) => {
    //     console.log('deleted role : ', res)
    //     if(res[0]) {
    //       const uid = res[0].payload.doc.id;
    //       this.firestore.collection('roles').doc(uid).delete();
    //     }
    //   })
    // )
  }

}
