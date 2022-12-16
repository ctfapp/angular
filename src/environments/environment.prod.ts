export const environment = {
    production: true,
    
    api: {
        auth:{
            url:'https://sicgo.decisor.com/navigatorauth',
        },
        sales: {
            search : 'https://sicgo.decisor.com/esb/v1/elasticsearch/search/nav_%2A_vendas/navigator',
            msearch : 'https://sicgo.decisor.com/esb/v1/elasticsearch/msearchh/nav_%2A_vendas/navigator'
        }
    }
};