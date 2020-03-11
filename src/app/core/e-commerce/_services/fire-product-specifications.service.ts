// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, forkJoin, of, from } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models and Consts
import { ProductSpecificationModel } from '../_models/product-specification.model';
import { SPECIFICATIONS_DICTIONARY } from '../_consts/specification.dictionary';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
const API_PRODUCTSPECS_URL = 'api/productSpecs';
import * as randomize from 'randomatic';
import { FireProductSpecificationModel } from '../../../_shared/models/firebase-product-specification.model';
const COLLECT_NAME = 'product-spec';

@Injectable({
  providedIn: 'root'
})
export class FireProductSpecificationsService {

  constructor(
    private http: HttpClient,
    private httpUtils: HttpUtilsService,
    public firestore: AngularFirestore,
    ) {}

	// CREATE =>  POST: add a new product specification to the server
	createProductSpec(productSpec): Observable<ProductSpecificationModel> {
    const id = randomize('0', 12);
    let newProductionSpec: FireProductSpecificationModel = this.getBlankFireProductSpecificationModel();
    Object.assign(newProductionSpec, productSpec);
    newProductionSpec.id = id;
    console.log('product specification to create', newProductionSpec);

    const productSpecRef: AngularFirestoreDocument<any> = this.firestore.doc(`${COLLECT_NAME}/${id}`);
    const subscription = from(productSpecRef.set(newProductionSpec, {merge: true})).pipe(
      map((res) => {
        let resultNewProductSpec = new ProductSpecificationModel();
        resultNewProductSpec.clear(productSpec.id);
        Object.assign(resultNewProductSpec, newProductionSpec);
        return resultNewProductSpec;
      })
    )

    return subscription;
		// // Note: Add headers if needed (tokens/bearer)
		// const httpHeaders = this.httpUtils.getHTTPHeaders();
		// return this.http.post<ProductSpecificationModel>(
		// 	API_PRODUCTSPECS_URL,
		// 	productSpec,
		// 	{ headers: httpHeaders }
		// );
	}

	// READ
	getAllProductSpecsByProductId(
		productId: number
	): Observable<ProductSpecificationModel[]> {
    const prodSpecs = this.firestore.collection(COLLECT_NAME).valueChanges().pipe(
      map((productSpec: ProductSpecificationModel[]) => {
        return productSpec.filter(spec => spec.carId === productId)
      })
    )

		// const prodSpecs = this.http
		// 	.get<ProductSpecificationModel[]>(API_PRODUCTSPECS_URL)
		// 	.pipe(
		// 		map(productSpecifications =>
		// 			productSpecifications.filter(ps => ps.carId === productId)
		// 		)
		// 	);

		return prodSpecs.pipe(
			map(res => {
				const _prodSpecs = res;
				const result: ProductSpecificationModel[] = [];
				_prodSpecs.forEach(item => {
					const _item = Object.assign({}, item);
					const specName = SPECIFICATIONS_DICTIONARY[_item.specId];
					if (specName) {
						_item._specificationName = specName;
					}
					result.push(_item);
				});
				return result;
			})
		);
	}

	getProductSpecById(productSpecId: number): Observable<ProductSpecificationModel> {
    let loadProductSpec = new ProductSpecificationModel();
    loadProductSpec.clear(0);
    return this.firestore.collection(COLLECT_NAME).doc(productSpecId.toString()).valueChanges().pipe(
      map((res) => {
        if(res) {
          Object.assign(loadProductSpec, res);
          return loadProductSpec
        }
        return loadProductSpec;
      })
    )

		// return this.http.get<ProductSpecificationModel>(
		// 	API_PRODUCTSPECS_URL + `/${productSpecId}`
		// );
	}

	findProductSpecs(
		queryParams: QueryParamsModel,
		productId: number): Observable<QueryResultsModel> {
		return this.getAllProductSpecsByProductId(productId).pipe(
			mergeMap(res => {
				const result = this.httpUtils.baseFilter(
					res,
					queryParams,
					[]
				);
				return of(result);
			})
		);
	}

	// UPDATE => PUT: update the product specification on the server
	updateProductSpec(productSpec: ProductSpecificationModel): Observable<any> {
    let updateProductSpec: FireProductSpecificationModel = this.getBlankFireProductSpecificationModel();
    Object.assign(updateProductSpec, productSpec);
    return from(this.firestore.collection(COLLECT_NAME).doc(productSpec.id.toString()).update(updateProductSpec))

		// return this.http.put(API_PRODUCTSPECS_URL, productSpec, {
		// 	headers: this.httpUtils.getHTTPHeaders()
		// });
	}

	// DELETE => delete the product specification from the server
	deleteProductSpec(productSpecId: number): Observable<any> {
    const subscription = from(this.firestore.collection(COLLECT_NAME).doc(productSpecId.toString()).delete());
    return subscription;
		// const url = `${API_PRODUCTSPECS_URL}/${productSpecId}`;
		// return this.http.delete<any>(url);
	}

	deleteProductSpecifications(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteProductSpec(ids[i]));
		}
		return forkJoin(tasks$);
	}

	getSpecs(): string[] {
		return SPECIFICATIONS_DICTIONARY;
  }
  // 
  getBlankFireProductSpecificationModel() {
    const fireProductSpecificationModel: FireProductSpecificationModel = {
      _isEditMode : false,
      _userId : 0, // Admin
      _createdDate: '',
      _updatedDate: '',

      id: 0,
      carId: 0,
      specId: 0,
      value: '',
    
      // Refs
      _carName: '',
      _specificationName: '',
    }
    
    return fireProductSpecificationModel
  }
}
