import { Base } from './base';

export interface FireProductRemarkModel extends Base {
	id: number;
	carId: number;
	text: string;
	type: number; // Info, Note, Reminder
	dueDate: string;
	_isEditMode: boolean;

	// Refs
	_carName: string;
}
