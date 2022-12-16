import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';

import { AuthService } from 'app/core/auth/auth.service';
import { User } from 'app/core/user/user.types';
import { DeviceDetectorService } from 'ngx-device-detector';

import { UserService } from 'app/core/user/user.service';

@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthSignInComponent implements OnInit
{
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    // finger print
    user: User;
    useFingerprint = true;
    webAuthnAvailable = !!navigator.credentials && !!navigator.credentials.create;
    isMobile = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _userService: UserService,
        private _deviceService: DeviceDetectorService
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

        
        this.isMobile = this._deviceService.isMobile();

        this.user =  {
            id: "id",
            name: "name",
            email: "email",
            avatar: "avatar",
            status: "online",

            credentials: []
        };

        this._userService.user$
        .subscribe(user => {
            this.user = user;

            //console.log(this.user);
        });

        // Create the form

        /*
        this.signInForm = this._formBuilder.group({
            //email     : ['hughes.brian@company.com', [Validators.required, Validators.email]],
            username     : ['fpereira@sinfic.pt', [Validators.required, Validators.email]],
            password  : ['Passw0rd!', Validators.required],
            rememberMe: [''],
        });
        */
        this.signInForm = this._formBuilder.group({
            username     : [, [Validators.required, Validators.email]],
            password  : [, Validators.required],
            rememberMe: [''],
        });

        /*
        this.signInForm = this._formBuilder.group({
            //email     : ['hughes.brian@company.com', [Validators.required, Validators.email]],
            username     : ['', [Validators.required, Validators.email]],
            password  : ['', Validators.required],
            rememberMe: [''],
        });
        */

        //show this if biometrics disabled"
        //this.useFingerprint = !user.biometricsEnabled
        /*
        if (this.webAuthnAvailable && this.useFingerprint) {

            const bioQueryDialog = this._fuseConfirmationService.open({
                "title": "Enable Biomatrics",
                "message": "Enabling Biometrics allows Navigator to unlock faster.",
                "icon": {
                "show": true,
                "name": "heroicons_outline:finger-print",
                "color": "info"
                },
                "actions": {
                "confirm": {
                    "show": true,
                    "label": "Enable",
                    "color": "primary"
                },
                "cancel": {
                    "show": true,
                    "label": "Cancel"
                }
                },
                "dismissible": true
            });

            // Subscribe to afterClosed from the dialog reference
            bioQueryDialog.afterClosed().subscribe((result) => {
                console.log(result);
                if(result == "confirmed"){
                    console.log("show biometrics set up");

                    this.webAuthSignUp()
                }
            });

        }
        */

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void
    {
        // Return if the form is invalid
        if ( this.signInForm.invalid )
        {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

    
        this.signInForm.value['rememberMe'] = this.signInForm.value['rememberMe'] ? this.signInForm.value['rememberMe'] : false
        
        // Sign in
        this._authService.signIn(this.signInForm.value)
            .subscribe(
                (response) => {
                    //console.log(response);

                    //console.log(this.user.credentials);
                    //show this if biometrics disabled"
                    //this.useFingerprint = !user.biometricsEnabled
                    if (this.isMobile && !this.user.credentials && this.webAuthnAvailable && this.useFingerprint) {

                        const bioQueryDialog = this._fuseConfirmationService.open({
                            "title": "Enable Biomatrics",
                            "message": "Enabling Biometrics allows Navigator to unlock faster.",
                            "icon": {
                            "show": true,
                            "name": "heroicons_outline:finger-print",
                            "color": "info"
                            },
                            "actions": {
                                "confirm": {
                                    "show": true,
                                    "label": "Enable",
                                    "color": "primary"
                                },
                                "cancel": {
                                    "show": true,
                                    "label": "Cancel"
                                }
                            },
                            "dismissible": true
                        });

                        // Subscribe to afterClosed from the dialog reference
                        bioQueryDialog.afterClosed().subscribe((result) => {
                            //console.log(result);
                            if(result == "confirmed"){
                                //console.log("show biometrics set up");

                                this.webAuthSignUp()
                            }
                        });
                    }

                    // Set the redirect url.
                    // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                    // to the correct page after a successful sign in. This way, that url can be set via
                    // routing file and we don't have to touch here.
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                    // Navigate to the redirect url
                    this._router.navigateByUrl(redirectURL);
                    

                },
                () => {

                    // Re-enable the form
                    this.signInForm.enable();

                    // Reset the form
                    this.signInNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: 'Wrong credentials'
                    };
                   /*
                   this.alert = {
                        type    : 'error',
                        message : 'Server unavailable.'
                   }
                   */
                    // Show the alert
                    this.showAlert = true;
                }
            );
    }

    webAuthSignIn()
    {
        //console.log("get user from jwt localstorage");
        // user must have biometrics boolean var...
        // so if true... continue..
        // if false... modal to request to enable...

        const user = this._userService.get(this.user.email);
        this._authService.webAuthnSignin(this.user).then((response) => {
            // TODO: validate attestion
            console.log('SUCCESSFULLY GOT AN ASSERTION!', response);
            })
            .catch((error) => {
            console.log('FAIL', error);
        });
    }

    webAuthSignUp()
    {
        this._authService.webAuthnSignup(this.user)
        .then((credential: PublicKeyCredential) => {
            console.log('credentials.create RESPONSE', credential);
            const valid = this._authService.registerCredential(this.user, credential);
        }).catch((error) => {
            console.log('credentials.create ERROR', error);
        });
    }


    /**
     * Private methods
     */
}
