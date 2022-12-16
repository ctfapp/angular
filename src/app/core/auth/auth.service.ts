import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { User } from '../user/user.types';
import { Account } from '../account/account.types';
import * as CBOR from '../utils/cbor';
import { ClientDataObj } from '../interfaces/client-data-obj';
import { DecodedAttestionObj } from '../interfaces/decoded-attestion-obj';

@Injectable()
export class AuthService
{
    private _authenticated: boolean = false;
    private _challenge: Uint8Array;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        //return this._httpClient.post('api/auth/forgot-password', email);

        return this._httpClient.post(environment.api.auth.url + '/auth/forgot-password', {email:email},{
            withCredentials: true
        }).pipe(
            switchMap((response: any) => {
                
                //console.log(response);

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(request: { username: string; password: string; token: string}): Observable<any>
    {
        //return this._httpClient.post('api/auth/reset-password', password);
        return this._httpClient.post(environment.api.auth.url + '/auth/reset-password', request, {
            withCredentials: true
        }).pipe(
            switchMap((response: any) => {

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    //signIn(credentials: { email: string; password: string }): Observable<any>
    signIn(credentials: { username: string; password: string; rememberMe: string}): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }

        //return this._httpClient.post('api/auth/sign-in', credentials).pipe(
        return this._httpClient.post(environment.api.auth.url + '/auth/sign-in', credentials,{
            withCredentials: true
        }).pipe(
            switchMap((response: any) => {
                
                //console.log(response);
                
                let jsonResponse = JSON.parse(response.response);
                
                let accessToken = jsonResponse['accessToken']['token'];

                let decodedToken = AuthUtils._decodeToken(accessToken);
                
                // Store the access token in the local storage
                this.accessToken = accessToken;
                //this.accessToken = "accessToken";

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                //this._userService.user = response.user;
                /**
                 *  id    : 'cfaad35d-07a3-4447-a6c3-d8c3d54fd5df',
                    name  : 'Brian Hughes',
                    email : 'hughes.brian@company.com',
                    avatar: 'assets/images/avatars/brian-hughes.jpg',
                    status: 'online'
                 */
                
                // TEST 
                /*let user =
                {
                    id: "id",
                    name: "Fernando",
                    email: "fp@sinfic.com",
                    avatar: 'assets/images/avatars/brian-hughes.jpg',
                    status: 'online',
                }*/
                
                let user =
                {
                    id: decodedToken.jti,
                    name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                    email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                    avatar: 'assets/images/avatars/male-01.png',
                    status: 'online',
                }
                
                this._userService.user = user;

                // Return a new observable with the response
                return of(response);
            }),
            catchError((error: any) => {
                if (error.status != 200) {
                  // handle error and use any value you like to return if that's your goal.
                  // This could be anything, like a number, string or an object, depending on your use-case.
                  const fallbackValue = error.statusText;
                  return throwError(fallbackValue); // You will get this in your subscription callback
                } else {
                  // return error
                  return throwError(error);
                }
              }),
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingTokenn(): Observable<any>
    {
        // Renew token
        //return this._httpClient.post('api/auth/refresh-access-token', {
        return this._httpClient.get(environment.api.auth.url + '/auth/refresh-access-token', {
            withCredentials: true
        }).pipe(
            catchError(() =>

                // Return false
                of(false)
            ),
            switchMap((response: any) => {
                if(response == undefined || response == null || response == false){
                    return of(false);
                }

                let jsonResponse = JSON.parse(response.response);
                
                let accessToken = jsonResponse['accessToken']['token'];
                
                let decodedToken = AuthUtils._decodeToken(accessToken);

                // Store the access token in the local storage
                this.accessToken = accessToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                //this._userService.user = response.user;

                let user =
                {
                    id: decodedToken.jti,
                    name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                    email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                    avatar: 'assets/images/avatars/brian-hughes.jpg',
                    status: 'online',
                }
                
                this._userService.user = user;

                // Return true
                return of(true);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( this.accessToken )
        {
            return of(true);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingTokenn();
    }



    getChallenge(): Observable<any>
    {
        // Renew token
        //return this._httpClient.post('api/auth/refresh-access-token', {
        return this._httpClient.get(environment.api.auth.url + '/auth/challenge', {
            withCredentials: true
        }).pipe(
            tap((response: string) => {
               
                //console.log(response);

                return Uint8Array.from(response, c => c.charCodeAt(0));
            })
        );
    }

    // Validate and Store credential
    registerCredential(user: User, credential: PublicKeyCredential): Observable<any>
    {
        
        // Should come from the server?
        const authData = this.extractAuthData(credential);
        const credentialIdLength = this.getCredentialIdLength(authData);
        const credentialId: Uint8Array = authData.slice(55, 55 + credentialIdLength);
        //console.log('credentialIdLength', credentialIdLength);
        //console.log('credentialId', credentialId);
        const publicKeyBytes: Uint8Array = authData.slice(55 + credentialIdLength);
        const publicKeyObject = CBOR.decode(publicKeyBytes.buffer);
        //console.log('publicKeyObject', publicKeyObject);

        const valid = true;

        if (valid) {
            //user.credentials.push( { credentialId, publicKey: publicKeyBytes } );
            //this.updateUser(user);
            var email = user.email;
            return this._httpClient.post(environment.api.auth.url + '/auth/register-credential', {email, credentialId, publicKey: publicKeyBytes },
            {
                withCredentials: true
            }).pipe(
                catchError(() =>

                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    
                    //console.log(response);

                    // Return true
                    return of(true);
                })
            );
            
        }

        return of(false);
    }


    getCredentialIdLength(authData: Uint8Array): number {
        // get the length of the credential ID
        const dataView = new DataView(new ArrayBuffer(2));
        const idLenBytes = authData.slice(53, 55);
        idLenBytes.forEach((value, index) => dataView.setUint8(index, value));
        return dataView.getUint16(0);
    }

    extractAuthData(credential: PublicKeyCredential): Uint8Array {
        // decode the clientDataJSON into a utf-8 string
        const utf8Decoder = new TextDecoder('utf-8');
        const decodedClientData = utf8Decoder.decode(credential.response.clientDataJSON);

        const clientDataObj: ClientDataObj = JSON.parse(decodedClientData);
        //console.log('clientDataObj', clientDataObj);

        const decodedAttestationObj: DecodedAttestionObj = CBOR.decode((credential.response as any).attestationObject);
        //console.log('decodedAttestationObj', decodedAttestationObj);

        const { authData } = decodedAttestationObj;
        //console.log('authData', authData);

        return authData;
    }
    

    // Fingerprint authentication
    webAuthnSignup(user: User): Promise<CredentialType> {
        //console.log('webAuthnSignup');
        
        //console.log(user);

        this.getChallenge()
        .pipe()
        .subscribe((challenge) => {
        
            // save data
            this._challenge = challenge;

        });

        //console.log(this._challenge);

        const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
          // Challenge should come from the server
          //challenge: this.getChallenge().,
          challenge : Uint8Array.from('someChallengeIsHereComOn', c => c.charCodeAt(0)),
          rp: {
            name: 'WebAuthn Test',
            id: 'localhost',
          },
          user: {
            // Some user id coming from the server
            id: Uint8Array.from(user.id, c => c.charCodeAt(0)),
            name: user.email,
            displayName: user.email,
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }
          ],
          authenticatorSelection: {
            userVerification: "preferred",
            authenticatorAttachment: 'platform',
            // requireResidentKey: true,
          },
          timeout: 60000,
          attestation: 'direct'
        };

        var credential  = navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions,
          });


          //console.log(credential);
          
          credential .catch(error=>{
            console.log(error);
        })

        /*return navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions,
        });*/
    
        return credential;
      }
    
    
      webAuthnSignin(user: User): Promise<CredentialType> {
        const allowCredentials: PublicKeyCredentialDescriptor[] = user.credentials.map(c => {
          //console.log(c.credentialId);
          return { type: 'public-key', id: Uint8Array.from(Object.values(c.credentialId)) };
        });
    
        //console.log('allowCredentials', allowCredentials);
    
        const credentialRequestOptions: PublicKeyCredentialRequestOptions = {
          //challenge: this.serverMockService.getChallenge(),
          challenge: Uint8Array.from('someChallengeIsHereComOn', c => c.charCodeAt(0)),
          allowCredentials,
        };
    
        return navigator.credentials.get({
          publicKey: credentialRequestOptions,
        });
      }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------
    /* private handleSuccessAuthentication(result: Result<string>): void {
        let message;
    
        if (result !== null && result.isSuccess && result.response.length > 1) {
          const decodedToken = jwtDecode<any>(result.response);
          const user = new User(
            decodedToken[Claims.NameTokenKey],
            decodedToken[Claims.EmailTokenKey],
            decodedToken[Claims.RoleTokenKey],
            result.response
          )
          localStorage.setItem(this.userKey, JSON.stringify(user));
    
          this.router.navigate(['/']);
          message = 'User has been authenticated.';
        } else if (result !== null && !result.isSuccess) {
          message = result.errors.join(' ');
        } else {
          message = 'Something went wrong.';
        }
    
        this.snackBar.open(message, 'Close', {duration: 3000});
      }*/

      private handleError(any): void {
       console.log(any); 
      }
}
