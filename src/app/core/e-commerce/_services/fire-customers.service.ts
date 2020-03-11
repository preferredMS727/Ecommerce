// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, forkJoin, of, from } from 'rxjs';
import { mergeMap, delay, retry, map } from 'rxjs/operators';
// Lodash
import { each } from 'lodash';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { CustomerModel } from '../_models/customer.model';
import { FireCustomerModel } from '../../../_shared/models/firebase-customer.model';
import moment from 'moment';
import * as randomize from 'randomatic';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';

const API_CUSTOMERS_URL = 'api/customers';
const COLLECT_NAME = 'customers'
@Injectable({
  providedIn: 'root'
})
export class FireCustomersService {
  constructor(
    private http: HttpClient,
    private httpUtils: HttpUtilsService,
    public firestore: AngularFirestore,
    ) { }

	// CREATE =>  POST: add a new customer to the server
	createCustomer(customer: CustomerModel): Observable<CustomerModel> {
    const id = randomize('0', 8);
    let newCustomer: FireCustomerModel = this.getBlankCustomerModel();
    Object.assign(newCustomer, customer);
    newCustomer.id = id;
    console.log('new customer to create: ', newCustomer);

    const customerRef: AngularFirestoreDocument<any> = this.firestore.doc(`${COLLECT_NAME}/${id}`);
    const subscription = from(customerRef.set(newCustomer, {merge: true})).pipe(
      map((res) => {
        console.log('this is firecustomer data to save: ', res);
        let resultNewCustomer = new CustomerModel();
        resultNewCustomer.clear();
        Object.assign(resultNewCustomer, newCustomer);
        return resultNewCustomer;
      })
    )
    return subscription;
		// Note: Add headers if needed (tokens/bearer)
		// const httpHeaders = this.httpUtils.getHTTPHeaders();
		// return this.http.post<CustomerModel>(API_CUSTOMERS_URL, customer, { headers: httpHeaders});
	}

	// READ
	getAllCustomers(): Observable<CustomerModel[]> {
    return this.firestore.collection(COLLECT_NAME).valueChanges().pipe(
      map((res: CustomerModel[]) => res)
    )
		// return this.http.get<CustomerModel[]>(API_CUSTOMERS_URL);
	}

	getCustomerById(customerId: number): Observable<CustomerModel> {
    return this.firestore.collection(COLLECT_NAME).doc(customerId.toString()).valueChanges().pipe(
      map((res: CustomerModel) => res)
    )
		// return this.http.get<CustomerModel>(API_CUSTOMERS_URL + `/${customerId}`);
	}

	// Method from server should return QueryResultsModel(items: any[], totalsCount: number)
	// items => filtered/sorted result
	findCustomers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
    return this.firestore.collection(COLLECT_NAME).valueChanges().pipe(
      mergeMap((res) => {
        const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'type']);
        return of(result);
      })
    )
		// This code imitates server calls
		// const url = API_CUSTOMERS_URL;
		// return this.http.get<CustomerModel[]>(API_CUSTOMERS_URL).pipe(
		// 	mergeMap(res => {
		// 		const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'type']);
		// 		return of(result);
		// 	})
		// );
	}


	// UPDATE => PUT: update the customer on the server
	updateCustomer(customer: CustomerModel): Observable<any> {
    let updateCustomer: FireCustomerModel = this.getBlankCustomerModel();
    Object.assign(updateCustomer, customer);
    const subscription = from(this.firestore.collection(COLLECT_NAME).doc(customer.id.toString()).update(updateCustomer))
    return subscription;
		// const httpHeader = this.httpUtils.getHTTPHeaders();
		// return this.http.put(API_CUSTOMERS_URL, customer, { headers: httpHeader });
	}

	// UPDATE Status
	updateStatusForCustomer(customers: CustomerModel[], status: number): Observable<any> {
		const tasks$ = [];
		each(customers, element => {
			const _customer = Object.assign({}, element);
			_customer.status = status;
			tasks$.push(this.updateCustomer(_customer));
		});
		return forkJoin(tasks$);
	}

	// DELETE => delete the customer from the server
	deleteCustomer(customerId: number): Observable<any> {
    const subscription = from(this.firestore.collection(COLLECT_NAME).doc(customerId.toString()).delete())
    return subscription;
		// const url = `${API_CUSTOMERS_URL}/${customerId}`;
		// return this.http.delete<CustomerModel>(url);
	}

	deleteCustomers(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteCustomer(ids[i]));
		}
		return forkJoin(tasks$);
  }
  
  getBlankCustomerModel() {
    // let now = moment("12/25/1995", "MM-DD-YYYY");
    let date = new Date();
    const blankCustomerModel: FireCustomerModel = {
      
      _isEditMode : false,
      _userId : 0, // Admin
      _createdDate: '',
      _updatedDate: '',

      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      userName: '',
      gender: '',
      status: 0, // 0 = Active | 1 = Suspended | Pending = 2
      dateOfBbirth: '',
      dob: date,
      ipAddress: '',
      type: 0, // 0 = Business | 1 = Individual
    };

    return blankCustomerModel;
  }
}
