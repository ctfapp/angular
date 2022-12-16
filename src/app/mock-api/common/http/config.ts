
// Types
export type Custom = Array<String>;
export type Currency = { filter: string; code: string };
export type DateTime = { gte: string; lte: string , selected: string};


/**
 * AppConfig interface. Update this interface to strictly type your config
 * object.
 */
export interface HttpConfig
{
    custom: Array<String>;
    currency: Currency;
    dateTime: DateTime;
}

/**
 * Default configuration for the entire application. This object is used by
 * FuseConfigService to set the default configuration.
 *
 * If you need to store global configuration for your app, you can use this
 * object to set the defaults. To access, update and reset the config, use
 * FuseConfigService and its methods.
 *
 * "Screens" are carried over to the BreakpointObserver for accessing them within
 * components, and they are required.
 *
 * "Themes" are required for Tailwind to generate themes.
 */
export const httpConfig: HttpConfig = {
    custom: [],
    currency: { filter:'Moeda:EUR', code:'EUR' },
    dateTime: { gte:gte(), lte:lte(), selected:'Y' }
};


function gte(): string {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    let time = '00:00:00.000Z';
    return yyyy + '-01-01T' + time;
}

function lte(): string {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    let time = '00:00:00.000Z';
    return yyyy + '-' + mm + '-' + dd + 'T' + time;
}

