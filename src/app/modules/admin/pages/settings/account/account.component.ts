import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Account } from 'app/core/account/account.types';
import { AccountService } from 'app/core/account/account.service';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector       : 'settings-account',
    templateUrl    : './account.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsAccountComponent implements OnInit, OnDestroy
{

    accountForm: UntypedFormGroup;
    account: Account;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _userService: UserService,
        private _accountService: AccountService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

         // Get the data
         this._accountService.account$
         .pipe(takeUntil(this._unsubscribeAll))
         .subscribe((account) => {
 
             // Store the data
             this.account = account;
 
             // Prepare the chart data
             this._setFormData(this.account);
         });

    }

    /**
     * On destroy
     */
     ngOnDestroy(): void
     {
         // Unsubscribe from all subscriptions
         this._unsubscribeAll.next(null);
         this._unsubscribeAll.complete();
     }

     private _setFormData(account: Account) {
        
        // Create the form
        /*
        this.accountForm = this._formBuilder.group({
            name    : ['Brian Hughes'],
            username: ['brianh'],
            title   : ['Senior Frontend Developer'],
            company : ['YXZ Software'],
            about   : ['Hey! This is Brian; husband, father and gamer. I\'m mostly passionate about bleeding edge tech and chocolate! 🍫'],
            email   : ['hughes.brian@mail.com', Validators.email],
            phone   : ['121-490-33-12'],
            country : ['usa'],
            language: ['english']
        });
        */
       
        this.accountForm = this._formBuilder.group({
            name    : [this.account.name],
            username: [this.account.username],
            title   : [this.account.title],
            company : [this.account.company],
            about   : [this.account.about],
            email   : [this.account.email, Validators.email],
            phone   : [this.account.phone],
            country : [this.account.country],
            language: [this.account.language]
        });
    }
}
