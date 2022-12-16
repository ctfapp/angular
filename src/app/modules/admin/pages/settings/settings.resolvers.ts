import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { AccountService } from 'app/core/account/account.service';

@Injectable({
    providedIn: 'root'
})
export class SettingsResolver implements Resolve<any>
{
    private _user: User;
    /**
     * Constructor
     */
    constructor(
        private _userService: UserService,
        private _accountService: AccountService)
    {
        this._userService.user$
        .subscribe(
            (user: User) => {
                this._user = user
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {   
        return this._accountService.get(this._user.email);
    }
}
