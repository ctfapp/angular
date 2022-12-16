import { coerceNumberProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';
import { AccountService } from 'app/core/account/account.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { conformsTo } from 'lodash';

@Component({
    selector       : 'settings-security',
    templateUrl    : './security.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class SettingsSecurityComponent implements OnInit
{
    initialData: any;
    securityForm: UntypedFormGroup;
    user: User;

    @ViewChild('securityNgForm') securityNgForm: NgForm;

   hasChange: boolean = false;
   pwdMatch: boolean = false;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _userService: UserService
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
        this._userService.user$
        .pipe()
        .subscribe(user =>{
            this.user = user;
            
            console.log(this.user);

            // Create the form
            this.initialData = {
                currentPassword  : '',
                newPassword      : '',
                biometrics       : this.user.hasBiometrics,
                twoStep          : true,
                askPasswordChange: false
            };

            this.securityForm = this._formBuilder.group(
                this.initialData
                );
        })

        this.securityForm.valueChanges.subscribe(form =>
            { 
                this.pwdMatch = this.securityForm.value.currentPassword == this.securityForm.value.newPassword;
                this.hasChange = false;
                Object.keys(form).map(key => {
                    if(form[key] != this.initialData[key]){
                        this.hasChange = true;
                    }
                });
          }
        );
    }

    save(): void
    {
        console.log(this.securityForm);

        // Return if the form is invalid
        if ( this.securityForm.invalid )
        {
            // Show the alert
            this.showAlert = true;

            // Set the alert
            this.alert = {
                type   : 'error',
                message: 'Invalid data.'
            };
            return;
        }

        if ( !this.hasChange )
        {
            console.log("Nothing to do.");
            return;
        }

        // Disable the form
        this.securityForm.disable();

        // Hide the alert
        this.showAlert = false;

        console.log("update user on server");

        // Re-enable the form
        this.securityForm.enable();

        // Reset the form
        //this.securityNgForm.resetForm(this.initialData);
        console.log("reset passwords fields");

        // Show the alert
        this.showAlert = true;

        // Set the alert
        this.alert = {
            type   : 'success',
            message: 'Security details updated.'
        };

    }

    cancel(): void
    {
        this.securityForm = this._formBuilder.group(this.initialData);
    }
}
