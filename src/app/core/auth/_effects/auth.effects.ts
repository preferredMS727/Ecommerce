// Angular
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
// RxJS
import { filter, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { defer, Observable, of } from 'rxjs';
// NGRX
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
// Auth actions
import { AuthActionTypes, Login, Logout, Register, UserLoaded, UserRequested } from '../_actions/auth.actions';
import { AuthService } from '../_services/index';
import { AppState } from '../../reducers';
import { environment } from '../../../../environments/environment';
import { isUserLoaded } from '../_selectors/auth.selectors';
import { User } from '../_models/user.model';
import { FireAuthService } from '../_services/fire-auth.service';

@Injectable()
export class AuthEffects {
    @Effect({ dispatch: false })
    login$ = this.actions$.pipe(
        ofType<Login>(AuthActionTypes.Login),
        tap(action => {
            localStorage.setItem(environment.authTokenKey, action.payload.authToken);
            localStorage.setItem(environment.authId, action.payload.authId)
            this.store.dispatch(new UserRequested());
        }),
    );

    @Effect({ dispatch: false })
    logout$ = this.actions$.pipe(
        ofType<Logout>(AuthActionTypes.Logout),
        tap(() => {
            localStorage.removeItem(environment.authTokenKey);
            localStorage.removeItem(environment.authId);
            this.fireAuthService.signOut();
            this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.returnUrl } });
        })
    );

    @Effect({ dispatch: false })
    register$ = this.actions$.pipe(
        ofType<Register>(AuthActionTypes.Register),
        tap(action => {
            localStorage.setItem(environment.authTokenKey, action.payload.authToken);
        })
    );

    @Effect({ dispatch: false })
    loadUser$ = this.actions$
        .pipe(
            ofType<UserRequested>(AuthActionTypes.UserRequested),
            withLatestFrom(this.store.pipe(select(isUserLoaded))),
            filter(([action, _isUserLoaded]) => !_isUserLoaded),
            mergeMap(([action, _isUserLoaded]) =>
                // this.auth.getUserByToken()
                this.fireAuthService.getUserData()
            ),
            tap(_user => {
                // console.log('this is fresh _user from firebase: ', _user)
                if (_user) {
                    this.store.dispatch(new UserLoaded({ user: _user }));
                } else {
                    this.store.dispatch(new Logout());
                }
            })
        );

    @Effect()
    init$: Observable<Action> = defer(() => {
        const userToken = localStorage.getItem(environment.authTokenKey);
        const userId = localStorage.getItem(environment.authId)
        let observableResult = of({ type: 'NO_ACTION' });
        if (userToken) {
            observableResult = of(new Login({ authToken: userToken, authId: userId }));
        }
        return observableResult;
    });

    private returnUrl: string;

    constructor(private actions$: Actions,
        private router: Router,
        private auth: AuthService,
        private fireAuthService: FireAuthService,
        private store: Store<AppState>) {

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.returnUrl = event.url;
            }
        });
    }
}
