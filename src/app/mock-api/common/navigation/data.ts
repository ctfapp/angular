/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'Dashboards',
        subtitle: 'Business dashboards',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'dashboards.sales',
                title: 'Sales',
                type : 'collapsable',
                icon : 'heroicons_outline:chart-pie',
                children: [
                    {
                        id   : 'dashboards.sales.total',
                        title: 'Total',
                        type : 'basic',
                        icon : 'heroicons_outline:menu-alt-2',
                        link : '/dashboards/sales/total'
                    },
                    {
                        id   : 'dashboards.sales.topperformance',
                        title: 'Top Performance',
                        type : 'basic',
                        icon : 'heroicons_outline:menu-alt-2',
                        link : '/dashboards/sales/topperformance'
                    }
                ]
            },
        ]
    },
    {
        id  : 'divider-1',
        type: 'divider'
    },
    {
        id   : 'pages.settings',
        title: 'Settings',
        type : 'basic',
        icon : 'heroicons_outline:cog',
        link : '/pages/settings'
    }
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'Dashboards',
        tooltip : 'Dashboards',
        type    : 'aside',
        icon    : 'heroicons_outline:home',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id   : 'pages.settings',
        title: 'Settings',
        tooltip : 'Settings',
        type : 'basic',
        icon : 'heroicons_outline:cog',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'Dashboards',
        tooltip : 'Dashboards',
        type    : 'aside',
        icon    : 'heroicons_outline:home',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id   : 'pages.settings',
        title: 'Settings',
        tooltip : 'Settings',
        type : 'basic',
        icon : 'heroicons_outline:cog',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'Dashboards',
        tooltip : 'Dashboards',
        type    : 'aside',
        icon    : 'heroicons_outline:home',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id   : 'pages.settings',
        title: 'Settings',
        tooltip : 'Settings',
        type : 'basic',
        icon : 'heroicons_outline:cog',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
