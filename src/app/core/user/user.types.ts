export interface User
{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
    hasBiometrics?: boolean;

    credentials?: WebCredential[];
}

export interface WebCredential {
    credentialId: Uint8Array;
    publicKey: Uint8Array;
}
