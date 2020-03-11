import { Base } from './base';
import { FireProductSpecificationModel } from './firebase-product-specification.model';
import { FireProductRemarkModel } from './firebase-product-remark.model';

export interface FirebaseProduct extends Base {
	id: number;
	model: string;
	manufacture: string;
	modelYear: number;
	mileage: number;
	description: string;
	color: string;
	price: number;
	condition: number;
	status: number;
	VINCode: string;

	_specs: FireProductSpecificationModel[];
	_remarks: FireProductRemarkModel[];
}