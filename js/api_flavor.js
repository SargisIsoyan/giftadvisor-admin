var globalConfig = require('./../config');

function requestInterceptor(RestangularProvider) {
    // use the custom query parameters function to format the API request correctly
    RestangularProvider.addFullRequestInterceptor(function (element, operation, what, url, headers, params) {
        if (operation == "getList") {
            if (what == "stickers") {
                url = url + '/search';
            }
            // custom pagination params
            if (params._page) {
                params.limit = params._perPage;
                params.page = params._page;
                delete params._page;
                delete params._perPage;
            }
            // custom sort params
            if (params._sortField) {
                params.sort = '["' + params._sortField + '","' + params._sortDir + '"]';
                delete params._sortField;
                delete params._sortDir;
            }
            // custom filters
            if (params._filters) {
                params.filter = params._filters;
                delete params._filters;
            }
            if (headers['Content-Range']) {
                headers['X-Total-Count'] = headers['Content-Range'].split('/').pop();
            }
        }
        return { params: params, headers: headers };
    });
}

function responseInterceptor(RestangularProvider, notification) {
    RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response) {
        if(data.status == 401){
            logout();
        }
        switch (operation){
            case "getList":
                response.totalCount = data.data.count;
                if(data.data.next){
                    response.next = data.data.next;
                }
                return data.data.items;
                break;
            case "get":
            case "post":
                return data.data;
                break;
            case "delete":
                if(data.status >= 400){
                    progression.done();
                    notification.log(data.message, {addnCls: 'humane-flatty-error'});
                }
                break;
        }
    });

}


function config(RestangularProvider ) {
    RestangularProvider.setDefaultHeaders({
        'x-key': globalConfig.api_key,
        'x-access-token': window.localStorage.getItem('access-token')
    });
}

function errorInterceptor(RestangularProvider) {
    RestangularProvider.setErrorInterceptor(function(response, deferred, responseHandler) {
        console.log(response);
        if(response.status == 401){
            logout();
        }
        return true;
    });
}

export default {requestInterceptor, responseInterceptor, config ,errorInterceptor}
