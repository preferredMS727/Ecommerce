import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { environment } from '../../../../environments/environment';
import { User } from '../_models/user.model';
import { FirebaseUserModel } from '../../../_shared/models/firebase-user.model';
import { QueryParamsModel, QueryResultsModel, HttpUtilsService } from '../../_base/crud';
import { map, catchError, mergeMap, tap } from 'rxjs/operators';
import { Observable, of, forkJoin, from } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as randomize from 'randomatic';

const COLLECT_NAME = 'users';
// import * as firebase from 'firebase-admin'

const API_USERS_URL = 'api/users';
@Injectable({
  providedIn: 'root'
})
export class FireAuthService {
  public userData = {
    email: ''
  };
  // totalUserCounter: number;
  constructor(
    public firestore: AngularFirestore,   // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    private http: HttpClient,
    private httpUtils: HttpUtilsService
  ) {
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    })
  }

  // Sign in with email/password
  signIn(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
  }

  signInWithToken(token) {
    return this.afAuth.auth.signInWithCustomToken(token)
  }

  // Sign up with email/password
  signUp(email, password) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  // Send email verfificaiton when new user sign up
  sendVerificationMail() {
    return this.afAuth.auth.currentUser.sendEmailVerification();
  }

  // Reset Forggot password
  forgotPassword(passwordResetEmail) {
    return this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail);
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null && user.emailVerified !== false) ? true : false;
  }

  // Sign in with Google
  GoogleAuth() {
    // return this.AuthLogin(new auth.GoogleAuthProvider());
  }

  // Auth logic to run auth providers
  // AuthLogin(provider) {
  //   return this.afAuth.auth.signInWithPopup(provider)
  //   .then((result) => {
  //      this.ngZone.run(() => {
  //         this.router.navigate(['dashboard']);
  //       })
  //     this.SetUserData(result.user);
  //   }).catch((error) => {
  //     window.alert(error)
  //   })
  // }

  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  setUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.firestore.doc(`users/${user.uid}`);

    const userFireDocData: FirebaseUserModel = {
      _isEditMode: false,
      _userId: 0, // Admin
      _createdDate: '',
      _updatedDate: '',

      id: user.uid,
      username: user.username,
      email: user.email,
      password: '',
      accessToken: user.refreshToken,
      refreshToken: user.refreshToken,
      roles: [2],
      pic: './assets/media/users/default.jpg',
      fullname: user.fullname,
      occupation: '',
      companyName: '',
      phone: '',
      address: {
        addressLine: '',
        city: '',
        state: '',
        postCode: '',
      },
      socialNetworks: {
        linkedIn: '',
        facebook: '',
        twitter: '',
        instagram: '',
      }
    }

    return userRef.set(userFireDocData, {
      merge: true
    })
  }

  // Sign out 
  signOut() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem('user');
      // this.router.navigate(['sign-in']);
    })
  }

  getUserData() {
    const userId = localStorage.getItem(environment.authId);
    let _user = new User();
    _user.clear();
    console.log('this is _user getUserData: ', _user)
    return this.firestore.collection('users').doc(userId).valueChanges().pipe(
      map((res) => {
        console.log('this is res getUserData: ', res)
        console.log('this is getUserData: ', _user)
        if (res) {
          Object.assign(_user, res)
          return _user;
        }
        return _user;
      })
    );
  }

  getAllUserData() {
    return this.firestore.collection('users').snapshotChanges();
  }


  getUserById(userId: number): Observable<User> {
    if (!userId) {
      return of(null);
    }

    const subscription = this.firestore.collection(COLLECT_NAME).doc(userId.toString()).valueChanges().pipe(
      map((res: User) => res)
    )
    return subscription;
    // return this.http.get<User>(API_USERS_URL + `/${userId}`);
  }

  // CREATE =>  POST: add a new user to the server
  createUser(user: User): Observable<User> {
    let newUser: FirebaseUserModel = this.getBlankFireUserModel();
    const subscription = from(this.afAuth.auth.createUserWithEmailAndPassword(user.email, '000000')).pipe(
      tap((res) => {
        console.log('new user is create firebase auth: ', res);
      }),
      map((registerUser) => registerUser.user.uid),
      map((registerdID) => {
        Object.assign(newUser, user);
        newUser.id = registerdID;
        newUser.address = {
          addressLine: '',
          city: '',
          state: '',
          postCode: '',
        };
        newUser.socialNetworks = {
          linkedIn: '',
          facebook: '',
          twitter: '',
          instagram: '',
        };
        const newUserRef: AngularFirestoreDocument<any> = this.firestore.doc(`${COLLECT_NAME}/${registerdID}`);
        return from(newUserRef.set(newUser, { merge: true }))
      }),
      map((result) => {
        console.log('new user create finally: ', result);
        let resultNewUser = new User();
        resultNewUser.clear();
        Object.assign(resultNewUser, newUser);
        return resultNewUser;
      })
    );
    return subscription;
  }

  // UPDATE => PUT: update the user on the server
  updateUser(user: User): Observable<any> {

    let updateUser = this.getBlankFireUserModel();
    Object.assign(updateUser, user);
    console.log('this is user data to update: ', user, updateUser);
    updateUser.address = {
      addressLine: '',
      city: '',
      state: '',
      postCode: '',
    };
    updateUser.socialNetworks = {
      linkedIn: '',
      facebook: '',
      twitter: '',
      instagram: '',
    }
    Object.assign(updateUser.address, user.address);
    Object.assign(updateUser.socialNetworks, user.socialNetworks);
    const subscription = from(this.firestore.collection('users').doc(user.id).update(updateUser))
    return subscription;
  }

  // deleteUser(user: User) {
  //   const subscription = from(this.firestore.collection(COLLECT_NAME).doc(user))
  //   this.firestore.doc('users/' + user.id).delete();
  // }

  // DELETE => delete the user from the server
  deleteUser(userId: string) {
    const subscription = from(this.firestore.collection(COLLECT_NAME).doc(userId).delete());
    return subscription;
    // const url = `${API_USERS_URL}/${userId}`;
    // return this.http.delete(url);
  }

  findUsers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
    return this.firestore.collection('users').valueChanges().pipe(
      mergeMap((response: User[]) => {
        const result: QueryResultsModel = this.httpUtils.baseFilter(response, queryParams, []);
        // this.totalUserCounter = result.totalCount;
        console.log('Find Users works normally: ', result)
        return of(result);
      })
    )
  }

  getBlankFireUserModel() {
    const fireUserModel: FirebaseUserModel = {
      _isEditMode: false,
      _userId: 0, // Admin
      _createdDate: '',
      _updatedDate: '',

      id: '',
      username: '',
      email: '',
      password: '',
      accessToken: '',
      refreshToken: '',
      roles: [],
      pic: './assets/media/users/default.jpg',
      fullname: '',
      occupation: '',
      companyName: '',
      phone: '',
      address: {
        addressLine: '',
        city: '',
        state: '',
        postCode: '',
      },
      socialNetworks: {
        linkedIn: '',
        facebook: '',
        twitter: '',
        instagram: '',
      }
    };
    return fireUserModel;
  }
}
