// Angular
import { Injectable } from '@angular/core';
// RxJS
import { of, Observable, defer, forkJoin, combineLatest } from 'rxjs';
import { mergeMap, map, withLatestFrom, filter, tap } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel, QueryParamsModel } from '../../_base/crud';
// Services
import { AuthService } from '../_services';
// State
import { AppState } from '../../../core/reducers';
// Selectors
import { allRolesLoaded } from '../_selectors/role.selectors';
// Actions
import {
    AllRolesLoaded,
    AllRolesRequested,
    RoleActionTypes,
    RolesPageRequested,
    RolesPageLoaded,
    RoleUpdated,
    RolesPageToggleLoading,
    RoleDeleted,
    RoleOnServerCreated,
    RoleCreated,
    RolesActionToggleLoading
} from '../_actions/role.actions';
import { FireRoleService } from '../_services/fire-role.service';
import { Role } from '../_models/role.model';

@Injectable()
export class RoleEffects {
    showPageLoadingDistpatcher = new RolesPageToggleLoading({ isLoading: true });
    hidePageLoadingDistpatcher = new RolesPageToggleLoading({ isLoading: false });

    showActionLoadingDistpatcher = new RolesActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new RolesActionToggleLoading({ isLoading: false });

    @Effect()
    loadAllRoles$ = this.actions$
        .pipe(
            ofType<AllRolesRequested>(RoleActionTypes.AllRolesRequested),
            withLatestFrom(this.store.pipe(select(allRolesLoaded))),
            filter(([action, isAllRolesLoaded]) => !isAllRolesLoaded),
            mergeMap(() => this.fireRoleService.getAllRoles()),
            // mergeMap(() => this.auth.getAllRoles()),
            map(roles => {
                return new AllRolesLoaded({roles});
            })
          );

    @Effect()
    loadRolesPage$ = this.actions$
        .pipe(
            ofType<RolesPageRequested>(RoleActionTypes.RolesPageRequested),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showPageLoadingDistpatcher);
                const requestToServer = this.fireRoleService.findRoles(payload.page);
                const lastQuery = of(payload.page);
                return combineLatest(requestToServer, lastQuery);
            }),
            map(response => {
                const result: QueryResultsModel = response[0];
                const lastQuery: QueryParamsModel = response[1];
                this.store.dispatch(this.hidePageLoadingDistpatcher);

                return new RolesPageLoaded({
                    roles: result.items,
                    totalCount: result.totalCount,
                    page: lastQuery
                });
            }),
        );

    @Effect()
    deleteRole$ = this.actions$
        .pipe(
            ofType<RoleDeleted>(RoleActionTypes.RoleDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.fireRoleService.deleteRole(payload.id);
                    // return this.auth.deleteRole(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateRole$ = this.actions$
        .pipe(
            ofType<RoleUpdated>(RoleActionTypes.RoleUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.fireRoleService.updateRole(payload.role);
                // return this.auth.updateRole(payload.role);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );


    @Effect()
    createRole$ = this.actions$
        .pipe(
            ofType<RoleOnServerCreated>(RoleActionTypes.RoleOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.fireRoleService.createRole(payload.role).pipe(
                    tap(res => {
                        console.log('this is created new role in effect: ', res)
                        const role = new Role();
                        role.clear();
                        role.id = 4;
                        // Object.assign(role, res);
                        this.store.dispatch(new RoleCreated({ role: role }));
                    })
                )
                
                // const role = new Role();
                // role.clear();
                // role.id = 4;
                // return this.auth.createRole(role).pipe(
                //     tap(res => {
                //         // const role = new Role();
                //         // role.clear();
                //         // role.id = 4;
                //         role.permissions = [4,5]
                //         console.log('this is created new role in effect: ', res, role)
                //         this.store.dispatch(new RoleCreated({ role: role }));
                //     })
                // );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    init$: Observable<Action> = defer(() => {
        return of(new AllRolesRequested());
    });

    constructor(
        private actions$: Actions, 
        private auth: AuthService, 
        private store: Store<AppState>,
        private fireRoleService: FireRoleService
        ) { }
}
