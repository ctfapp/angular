import { Layout } from 'app/layout/layout.types';

// Types
export type Scheme = 'auto' | 'dark' | 'light';
export type Screens = { [key: string]: string };
export type Theme = 'theme-default' | string;
export type Themes = { id: string; name: string }[];

/**
 * AppConfig interface. Update this interface to strictly type your config
 * object.
 */
export interface AppConfig
{
    colors: {
        success: string,
        info: string,
        warning: string,
        danger: string,
        dark: string,
        black: string,
        grey: string,
        white: string,
        body: string,
        headingColor: string,
        axisColor: string,
        borderColor: string,
        red: string,
        sales: {},
        chart: any
    }
    legend: {
        fontSize: string
    }

    layout: Layout;
    scheme: Scheme;
    screens: Screens;
    theme: Theme;
    themes: Themes;
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
export const appConfig: AppConfig = {
    colors: {
        success: '#71dd37',
        info: '#03c3ec',
        warning: '#ffab00',
        danger: '#ff3e1d',
        dark: '#233446',
        black: '#000',
        grey: '#eceef1',
        white: '#fff',
        body: '#f4f5fb',
        headingColor: '#566a7f',
        axisColor: '#a1acb8',
        borderColor: '#eceef1',
        red: '#ee789d',
        sales: {
            group: '#9170b8',
            notgroup: '#ca8eae',
            product: '#7999d9',
            service: '#d9b879',
            marketInternal: '#da8b45',
            marketExternal: '#b9a888',
            marketCommunity: '#d6bf57',
            netValue: '#76c2ad',
            grossMargin: '#6092c0',
            quantity: '#d6bf57'
        },
        chart: ["#6dccb1", "#79aad9", "#ee789d", "#a987d1", "#e4a6c7", "#f1d86f", "#d2c0a0", "#c47c6c", "#ff7e62", "#f5a35c", "#c3f3e5"]
    },
    legend:{
        fontSize: '15px'
    },

    layout : 'classy',
    scheme : 'light',
    screens: {
        sm: '600px',
        md: '960px',
        lg: '1280px',
        xl: '1440px'
    },
    theme  : 'theme-default',
    themes : [
        {
            id  : 'theme-default',
            name: 'Default'
        },
        {
            id  : 'theme-brand',
            name: 'Brand'
        },
        {
            id  : 'theme-teal',
            name: 'Teal'
        },
        {
            id  : 'theme-rose',
            name: 'Rose'
        },
        {
            id  : 'theme-purple',
            name: 'Purple'
        },
        {
            id  : 'theme-amber',
            name: 'Amber'
        },
    ]
};
