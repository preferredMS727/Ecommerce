import { Base } from './base';

export interface FirebaseRole extends Base {
    id: number;
    title: string;
    permissions: number[];
    isCoreRole: boolean;
}