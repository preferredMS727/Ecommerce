import { Base } from './base';
import { Address } from './address';
import { SocialNetworks } from './social-networks';

export interface FirebaseUserModel extends Base {
    id: string;
    username: string;
    password: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    roles: number[];
    pic: string;
    fullname: string;
    occupation: string;
    companyName: string;
    phone: string;
    address: Address;
    socialNetworks: SocialNetworks;
}