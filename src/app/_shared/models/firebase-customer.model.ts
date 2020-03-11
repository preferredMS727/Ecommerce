import { Base } from './base';

export interface FireCustomerModel extends Base {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    gender: string;
    status: number; // 0 = Active | 1 = Suspended | Pending = 2
    dateOfBbirth: string;
    dob: Date;
    ipAddress: string;
    type: number; // 0 = Business | 1 = Individual
}
