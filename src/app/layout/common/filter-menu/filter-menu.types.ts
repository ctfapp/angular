export type Custom = Array<String>;
export type Currency = { filter: string; code: string };
export type DateTime = { gte: string; lte: string , selected: string};

export enum FilterStatus { FOR = 1, OUT = 2, NO = 0 };

export interface Tag
{
    id: string, // should id be the same as search data!? coz if cant search the same thing twice... or Name+Value that is also similar to searchData
    name: string;
    value: string;
    searchData: string;
    color: string;
    filterStatus: FilterStatus; // if to include or exclude from searching
    selected: boolean;
    prop?: any; // custom properties
};

export interface TagFilter
{
    custom: Array<Tag>;
    currency: Currency;
    dateTime: DateTime;
};

export interface Filter
{
    customTag: Array<Tag>;
    custom: Array<string>;
    currency: Currency;
    dateTime: DateTime;
};

export interface FilterPropagate
{
    propagate: Boolean;
    filter: Filter;
};

export const filterPropagateDefault: FilterPropagate = {
    propagate: false,
    filter:{
        customTag: [],
        custom: [],
        currency: { filter: 'Moeda:EUR', code: 'EUR' },
        dateTime: { gte: gte(), lte: lte(), selected: 'Y' },
    }
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



export interface Chat
{
    id?: string;
    contactId?: string;
    contact?: Contact;
    unreadCount?: number;
    muted?: boolean;
    lastMessage?: string;
    lastMessageAt?: string;
    messages?: {
        id?: string;
        chatId?: string;
        contactId?: string;
        isMine?: boolean;
        value?: string;
        createdAt?: string;
    }[];
}

export interface Contact
{
    id?: string;
    avatar?: string;
    name?: string;
    about?: string;
    details?: {
        emails?: {
            email?: string;
            label?: string;
        }[];
        phoneNumbers?: {
            country?: string;
            phoneNumber?: string;
            label?: string;
        }[];
        title?: string;
        company?: string;
        birthday?: string;
        address?: string;
    };
    attachments?: {
        media?: any[];
        docs?: any[];
        links?: any[];
    };
}
