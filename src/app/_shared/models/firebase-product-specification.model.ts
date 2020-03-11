import { Base } from './base';

export interface FireProductSpecificationModel extends Base {
	id: number;
	carId: number;
	specId: number;
	value: string;

	// Refs
	_carName: string;
	_specificationName: string;
}