import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, forkJoin, BehaviorSubject, of, from } from 'rxjs';
import { mergeMap, map, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { ProductModel } from '../_models/product.model';
import { each } from 'lodash';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { FirebaseProduct } from '../../../_shared/models/firebase-product.model';
import * as randomize from 'randomatic';

const API_PRODUCTS_URL = 'api/products';

@Injectable({
  providedIn: 'root'
})
export class FireProductsService {

  productTotalCount: number = 0;
  constructor(
    private http: HttpClient,
    private httpUtils: HttpUtilsService,
    public firestore: AngularFirestore,
  ) { }

  // CREATE =>  POST: add a new product to the server
  createProduct(product): Observable<ProductModel> {
    const id = randomize('0', 12);
    let newProduct: FirebaseProduct = this.getBlankFireBlankModel();
    Object.assign(newProduct, product);
    newProduct.id = id;
    const productRef: AngularFirestoreDocument<any> = this.firestore.doc(`products/${id}`);
    const subscription = from(productRef.set(newProduct, { merge: true })).pipe(
      map((res) => {
        let resultNewProduct = new ProductModel();
        resultNewProduct.clear();
        Object.assign(resultNewProduct, newProduct)
        return resultNewProduct;
      })
    )
    return subscription;
  }

  // UPDATE => PUT: update the product on the server
  updateProduct(product: ProductModel): Observable<any> {
    let updateProductData: FirebaseProduct = this.getBlankFireBlankModel();
    Object.assign(updateProductData, product);
    return from(this.firestore.collection('products').doc(product.id.toString()).update(updateProductData))
  }

  
	// UPDATE Status
	// Comment this when you start work with real server
	// This code imitates server calls
	updateStatusForProduct(products: ProductModel[], status: number): Observable<any> {
		const tasks$ = [];
		each(products, element => {
			const _product = Object.assign({}, element);
			_product.status = status;
			tasks$.push(this.updateProduct(_product));
		});
		return forkJoin(tasks$);
	}

	// DELETE => delete the product from the server
	deleteProduct(productId: number): Observable<any> {
    // console.log('deleted product result: ', productId)
    const subscription = from(this.firestore.collection('products').doc(productId.toString()).delete());
    return subscription
	}

	deleteProducts(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteProduct(ids[i]));
		}
		return forkJoin(tasks$);
	}

  findProducts(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
    return this.firestore.collection('products').valueChanges().pipe(
      mergeMap((res: ProductModel[]) => {
        console.log('findProducts works well in fireProducts service: ', res)
        const result = this.httpUtils.baseFilter(res, queryParams, ['status', 'condition']);
        return of(result)
      })
    )
  }

  getProductById(productId: number): Observable<ProductModel> {
    let loadProduct = new ProductModel();
    loadProduct.clear();
    return this.firestore.collection('products').doc(productId.toString()).valueChanges().pipe(
      map(res => {
        if(res) {
          Object.assign(loadProduct, res);
          return loadProduct
        }
        return loadProduct
      })
    )
	}

  getBlankFireBlankModel() {
    const fireProduct: FirebaseProduct = {
      _isEditMode: false,
      _userId: 0, // Admin
      _createdDate: '',
      _updatedDate: '',

      id: 0,
      model: '',
      manufacture: '',
      modelYear: 0,
      mileage: 0,
      description: '',
      color: '',
      price: 0,
      condition: 0,
      status: 0,
      VINCode: '',
      _specs: [],
      _remarks: [],
    }
    return fireProduct;
  }
}
