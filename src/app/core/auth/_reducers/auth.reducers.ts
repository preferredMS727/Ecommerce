// Actions
import { AuthActions, AuthActionTypes } from '../_actions/auth.actions';
// Models
import { User } from '../_models/user.model';

export interface AuthState {
    loggedIn: boolean;
    authToken: string;
    authId: string;
    user: User;
    isUserLoaded: boolean;
}

export const initialAuthState: AuthState = {
    loggedIn: false,
    authToken: undefined,
    authId: undefined,
    user: undefined,
    isUserLoaded: false
};

export function authReducer(state = initialAuthState, action: AuthActions): AuthState {
    switch (action.type) {
        case AuthActionTypes.Login: {
            const _token: string = action.payload.authToken;
            const _id: string = action.payload.authId;
            return {
                loggedIn: true,
                authToken: _token,
                authId: _id,
                user: undefined,
                isUserLoaded: false
            };
        }

        case AuthActionTypes.Register: {
            const _token: string = action.payload.authToken;
            return {
                loggedIn: true,
                authToken: _token,
                authId: undefined,
                user: undefined,
                isUserLoaded: false
            };
        }

        case AuthActionTypes.Logout:
            return initialAuthState;

        case AuthActionTypes.UserLoaded: {
            const _user: User = action.payload.user;
            return {
                ...state,
                user: _user,
                isUserLoaded: true
            };
        }

        default:
            return state;
    }
}
