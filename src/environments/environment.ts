// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    
    api: {
        auth:{
            url:'https://localhost:7215',
        },
        sales: {
            search : 'https://sicgo.decisor.com/esb/v1/elasticsearch/search/nav_%2A_vendas/navigator',
            //msearch : 'https://sicgo.decisor.com/esb/v1/elasticsearch/msearch/nav_%2A_vendas/navigator'
            msearch : 'https://sicgo.decisor.com/esb/v1/elasticsearch/msearchh/nav_%2A_vendas/navigator'
        }
    }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
