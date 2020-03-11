import { Injectable } from '@angular/core';
// RxJS
import { Observable, of, forkJoin, from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { ProductRemarkModel } from '../_models/product-remark.model';

import * as randomize from 'randomatic';
import { FireProductRemarkModel } from '../../../_shared/models/firebase-product-remark.model';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
const collectName = 'products-remark';

@Injectable({
  providedIn: 'root'
})

export class FireProductRemarksService {

  constructor(
    private httpUtils: HttpUtilsService,
    public firestore: AngularFirestore,
  ) { }

  // CREATE =>  POST: add a new product remark to the server
  createProductRemark(productRemark): Observable<ProductRemarkModel> {
    console.log('this is fireProductRemark Data to save: ', productRemark);
    const id = randomize('0', 12);
    let newProductRemark: FireProductRemarkModel = this.getBlankFireProductRemarkModel();
    Object.assign(newProductRemark, productRemark);
    if (!newProductRemark._createdDate) {
      newProductRemark._createdDate = newProductRemark._updatedDate;
    }
    newProductRemark.id = id;
    const productRemarkRef: AngularFirestoreDocument<any> = this.firestore.doc(`products-remark/${id}`);
    const subscription = from(productRemarkRef.set(newProductRemark, { merge: true })).pipe(
      map((res) => {
        console.log('this is fireProductRemark Data to save: ', res);
        let resultNewProductRemark = new ProductRemarkModel();
        resultNewProductRemark.clear(productRemark.id);
        Object.assign(resultNewProductRemark, newProductRemark);
        return resultNewProductRemark;
      })
    )
    return subscription;
  }

  // UPDATE => PUT: update the product remark
  updateProductRemark(productRemark: ProductRemarkModel): Observable<any> {
    let updateProductRemark: FireProductRemarkModel = this.getBlankFireProductRemarkModel();
    Object.assign(updateProductRemark, productRemark);
    return from(this.firestore.collection('products-remark').doc(productRemark.id.toString()).update(updateProductRemark))
  }

  getProductRemarkById(productRemarkId: number): Observable<ProductRemarkModel> {
    let loadProductRemark = new ProductRemarkModel();
    loadProductRemark.clear(0);
    return this.firestore.collection(collectName).doc(productRemarkId.toString()).valueChanges().pipe(
      map(res => {
        if (res) {
          Object.assign(loadProductRemark, res);
          return loadProductRemark;
        }
        return loadProductRemark;
      })
    )
  }

  // READ
  getAllProductRemarksByProductId(
    productId: number
  ): Observable<ProductRemarkModel[]> {
    return this.firestore.collection(collectName).valueChanges().pipe(
      map((productRemarks: ProductRemarkModel[]) => {
        return productRemarks.filter(rem => rem.carId === productId);
      })
    )
  }

  findProductRemarks(
    queryParams: QueryParamsModel,
    productId: number
  ): Observable<QueryResultsModel> {
    return this.getAllProductRemarksByProductId(productId).pipe(
      mergeMap(res => {
        const result = this.httpUtils.baseFilter(res, queryParams, []);
        return of(result);
      })
    );
  }

  // DELETE => delete the product remark
  deleteProductRemark(productRemarkId: number): Observable<any> {
    console.log('this is productRemardId to delete: ', productRemarkId);
    const subscription = from(this.firestore.collection(collectName).doc(productRemarkId.toString()).delete());
    return subscription;
  }

  deleteProductRemarks(ids: number[] = []): Observable<any> {
    const tasks$ = [];
    const length = ids.length;
    // tslint:disable-next-line:prefer-const
    for (let i = 0; i < length; i++) {
      tasks$.push(this.deleteProductRemark(ids[i]));
    }
    return forkJoin(tasks$);
  }

  getBlankFireProductRemarkModel() {
    const fireProductRemark: FireProductRemarkModel = {
      _isEditMode: false,
      _userId: 0, // Admin
      _createdDate: '',
      _updatedDate: '',

      id: 0,
      carId: 0,
      text: '',
      type: 0, // Info, Note, Reminder
      dueDate: '',
      // Refs
      _carName: '',
    }
    return fireProductRemark;
  }
}
