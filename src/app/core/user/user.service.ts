import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { User } from 'app/core/user/user.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User)
    {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User>
    {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(username: string): Observable<any>
    {
        //return this._httpClient.get<User>('api/common/user').pipe(
        return this._httpClient.get(environment.api.auth.url + '/User?username=' + encodeURIComponent(username) + '&email=email', {
            withCredentials: true
        }).pipe(
            tap((response: any) => {
                let user = JSON.parse(response.response).user;
                
                user = {
                    id    : '9a4c2165-c758-4bc4-a9f5-9eca14f7a8a9',
                    name  : user.FirstName + " " + user.LastName,
                    email : user.Email,
                    avatar: 'assets/images/avatars/male-01.png',
                    status: 'online',
                    hasBiometrics: false
                };

                this._user.next(user);
            })
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any>
    {
        return this._httpClient.patch<User>('api/common/user', {user}).pipe(
            map((response) => {
                this._user.next(response);
            })
        );
    }
}
