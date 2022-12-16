import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FuseNavigationItem } from '@fuse/components/navigation/navigation.types';
import { FuseConfigService } from '@fuse/services/config';
import { AppConfig, Scheme, Theme, Themes } from 'app/core/config/app.config';
import { Layout } from 'app/layout/layout.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector    : 'demo-sidebar',
    templateUrl : './demo-sidebar.component.html',
    styleUrls   : ['./demo-sidebar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs     : 'demoSidebar'
})
export class DemoSidebarComponent implements OnInit, OnDestroy
{
    config: AppConfig;
    layout: Layout;
    scheme: 'dark' | 'light';
    theme: string;
    themes: Themes;

    drawerOpened: boolean;
    menuData: FuseNavigationItem[];

    companySelected: string[];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _fuseConfigService: FuseConfigService
    )
    {
        this.drawerOpened = false;

        this.menuData = [
            {
                title   : 'Actions',
                subtitle: 'Task, project & team',
                type    : 'group',
                children: [
                    {
                        title: 'Create task',
                        type : 'basic',
                        icon : 'heroicons_outline:plus-circle'
                    },
                    {
                        title: 'Create team',
                        type : 'basic',
                        icon : 'heroicons_outline:user-group'
                    },
                    {
                        title: 'Create project',
                        type : 'basic',
                        icon : 'heroicons_outline:briefcase'
                    },
                    {
                        title: 'Create user',
                        type : 'basic',
                        icon : 'heroicons_outline:user-add'
                    },
                    {
                        title   : 'Assign user or team',
                        subtitle: 'Assign to a task or a project',
                        type    : 'basic',
                        icon    : 'heroicons_outline:badge-check'
                    }
                ]
            },
            {
                title   : 'Tasks',
                type    : 'group',
                children: [
                    {
                        title: 'All tasks',
                        type : 'basic',
                        icon : 'heroicons_outline:clipboard-list',
                        badge: {
                            title  : '49',
                            classes: 'px-2 bg-primary text-on-primary rounded-full'
                        }
                    },
                    {
                        title: 'Ongoing tasks',
                        type : 'basic',
                        icon : 'heroicons_outline:clipboard-copy'
                    },
                    {
                        title: 'Completed tasks',
                        type : 'basic',
                        icon : 'heroicons_outline:clipboard-check'
                    },
                    {
                        title: 'Abandoned tasks',
                        type : 'basic',
                        icon : 'heroicons_outline:clipboard'
                    },
                    {
                        title: 'Assigned to me',
                        type : 'basic',
                        icon : 'heroicons_outline:user'
                    },
                    {
                        title: 'Assigned to my team',
                        type : 'basic',
                        icon : 'heroicons_outline:users'
                    }
                ]
            },
            {
                title   : 'Settings',
                type    : 'group',
                children: [
                    {
                        title   : 'General',
                        type    : 'collapsable',
                        icon    : 'heroicons_outline:cog',
                        children: [
                            {
                                title: 'Tasks',
                                type : 'basic'
                            },
                            {
                                title: 'Users',
                                type : 'basic'
                            },
                            {
                                title: 'Teams',
                                type : 'basic'
                            }
                        ]
                    },
                    {
                        title   : 'Account',
                        type    : 'collapsable',
                        icon    : 'heroicons_outline:user-circle',
                        children: [
                            {
                                title: 'Personal',
                                type : 'basic'
                            },
                            {
                                title: 'Payment',
                                type : 'basic'
                            },
                            {
                                title: 'Security',
                                type : 'basic'
                            }
                        ]
                    }
                ]
            },
            {
                type: 'divider'
            }
        ];
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
     ngOnInit(): void
     {
         // Subscribe to config changes
        this._fuseConfigService.config$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((config: AppConfig) => {

            // Store the config
            this.config = config;
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

     // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set the layout on the config
     *
     * @param layout
     */
    setLayout(layout: string): void
    {
        // Clear the 'layout' query param to allow layout changes
        this._router.navigate([], {
            queryParams        : {
                layout: null
            },
            queryParamsHandling: 'merge'
        }).then(() => {

            // Set the config
            this._fuseConfigService.config = {layout};
        });
    }

    /**
     * Set the scheme on the config
     *
     * @param scheme
     */
    setScheme(scheme: Scheme): void
    {
        this._fuseConfigService.config = {scheme};
    }

    /**
     * Set the theme on the config
     *
     * @param theme
     */
    setTheme(theme: Theme): void
    {
        this._fuseConfigService.config = {theme};
    }

    toggleDrawerOpen(): void
    {
        this.drawerOpened = !this.drawerOpened;
    }

    setCompany(company: string): void
    {
        console.log(company);
    }
}
