import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, ReplaySubject, Subject, takeUntil, tap } from 'rxjs';
import { Account } from 'app/core/account/account.types';
import { environment } from 'environments/environment';
import { UserService } from '../user/user.service';
import { User } from '../user/user.types';

@Injectable({
    providedIn: 'root'
})
export class AccountService
{
    private _account: ReplaySubject<Account> = new ReplaySubject<Account>(1);

    _user: User;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService)
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
    set account(value: Account)
    {
        // Store the value
        this._account.next(value);
    }

    get account$(): Observable<Account>
    {
        return this._account.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(username: string): Observable<any>
    {   
        //return this._httpClient.get<Account>('api/common/user').pipe(
        return this._httpClient.get(environment.api.auth.url + '/User?username=' + encodeURIComponent(username) + '&email=email', {
            withCredentials: true
        }).pipe(
            tap((response: any) => {
                if(response.isSuccess){
                    let account = JSON.parse(response.response).user;

                    account = {
                        id: "id",
                        name: account.FirstName + " " + account.LastName,
                        username: account.UserName,
                        title: "admin",
                        company: account.Company,
                        about: "",
                        email: account.Email,
                        phone: account.PhoneNumber,
                        country: "Portugal",
                        status: "",
                        language: ""
                    }

                    this._account.next(account);
                }
            })
        
        );
    }

    /**
     * Update the user
     *
     * @param account
     */
    update(account: Account): Observable<any>
    {
        return this._httpClient.patch<Account>('api/common/user', {account}).pipe(
            map((response) => {
                this._account.next(response);
            })
        );
    }
}
