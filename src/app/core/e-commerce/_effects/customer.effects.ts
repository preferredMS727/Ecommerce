import { QueryParamsModel } from './../../_base/crud/models/query-models/query-params.model';
import { forkJoin, combineLatest } from 'rxjs';
// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, delay } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { CustomersService, FireCustomersService } from '../_services/';
// State
import { AppState } from '../../../core/reducers';
// Actions
import {
    CustomerActionTypes,
    CustomersPageRequested,
    CustomersPageLoaded,
    ManyCustomersDeleted,
    OneCustomerDeleted,
    CustomerActionToggleLoading,
    CustomersPageToggleLoading,
    CustomerUpdated,
    CustomersStatusUpdated,
    CustomerCreated,
    CustomerOnServerCreated
} from '../_actions/customer.actions';
import { of } from 'rxjs';

@Injectable()
export class CustomerEffects {
    showPageLoadingDistpatcher = new CustomersPageToggleLoading({ isLoading: true });
    showActionLoadingDistpatcher = new CustomerActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new CustomerActionToggleLoading({ isLoading: false });

    @Effect()
    loadCustomersPage$ = this.actions$.pipe(
        ofType<CustomersPageRequested>(CustomerActionTypes.CustomersPageRequested),
        mergeMap(( { payload } ) => {
            this.store.dispatch(this.showPageLoadingDistpatcher);
            const requestToServer = this.fireCustomersServices.findCustomers(payload.page);
            const lastQuery = of(payload.page);
            return combineLatest(requestToServer, lastQuery);
        }),
        map(response => {
            const result: QueryResultsModel = response[0];
            const lastQuery: QueryParamsModel = response[1];
            const pageLoadedDispatch = new CustomersPageLoaded({
                customers: result.items,
                totalCount: result.totalCount,
                page: lastQuery
            });
            return pageLoadedDispatch;
        })
    );

    @Effect()
    deleteCustomer$ = this.actions$
        .pipe(
            ofType<OneCustomerDeleted>(CustomerActionTypes.OneCustomerDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.fireCustomersServices.deleteCustomer(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    deleteCustomers$ = this.actions$
        .pipe(
            ofType<ManyCustomersDeleted>(CustomerActionTypes.ManyCustomersDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showActionLoadingDistpatcher);
                    return this.fireCustomersServices.deleteCustomers(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateCustomer$ = this.actions$
        .pipe(
            ofType<CustomerUpdated>(CustomerActionTypes.CustomerUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.fireCustomersServices.updateCustomer(payload.customer);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    updateCustomersStatus$ = this.actions$
        .pipe(
            ofType<CustomersStatusUpdated>(CustomerActionTypes.CustomersStatusUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.fireCustomersServices.updateStatusForCustomer(payload.customers, payload.status);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            })
        );

    @Effect()
    createCustomer$ = this.actions$
        .pipe(
            ofType<CustomerOnServerCreated>(CustomerActionTypes.CustomerOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showActionLoadingDistpatcher);
                return this.fireCustomersServices.createCustomer(payload.customer).pipe(
                    tap(res => {
                        this.store.dispatch(new CustomerCreated({ customer: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    constructor(
        private actions$: Actions, 
        // private customersService: CustomersService,
        private store: Store<AppState>,
        private fireCustomersServices: FireCustomersService) { }
}
