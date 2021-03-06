// require('ng-admin'); removed here and added back as a <script> tag to hep debugging - WebPack doesn't properly handle sourcemaps of dependencies yet
var config = require('./../config');
require('angular-moment');
require('angular-nvd3');
require('iso-3166-country-codes-angular');
require('./directives/masonry');
require('./products/color-picker.min');
var adminApp = angular.module('adminApp', ['ng-admin', 'angularMoment', 'iso-3166-country-codes', 'masonry', 'nvd3','colorpicker']);
require('./controllers/authController')(adminApp);
require('./controllers/customController')(adminApp);
require('./controllers/stickerImagesController')(adminApp);
require('./controllers/stickerStatisticsController')(adminApp);
require('./controllers/imageResizeController')(adminApp);

// custom API flavor
var apiFlavor = require('./api_flavor');
adminApp.config(['RestangularProvider', apiFlavor.config]);
adminApp.config(['RestangularProvider', apiFlavor.requestInterceptor]);
adminApp.config(['RestangularProvider', apiFlavor.errorInterceptor]);
adminApp.config(['RestangularProvider', apiFlavor.responseInterceptor]);

// custom 'amount' type
adminApp.config(['NgAdminConfigurationProvider', 'FieldViewConfigurationProvider', function (nga, fvp) {
    nga.registerFieldType('amount', require('./types/AmountField'));
    fvp.registerFieldView('amount', require('./types/AmountFieldView'));
}]);

// custom directives
adminApp.directive('approveSticker', require('./products/approveSticker'));
adminApp.directive('batchApprove', require('./directives/batchApprove'));
adminApp.directive('fileField', require('./products/fileField'));
adminApp.directive('templateImages', require('./templates/templateImages'));
//adminApp.directive('dashboardSummary', require('./dashboard/dashboardSummary'));
adminApp.directive('zoomInSticker', require('./directives/zoomInSticker'));
adminApp.directive('zoomInModal', require('./directives/zoomInModal'));
adminApp.directive('productImage', require('./directives/productImage'));
adminApp.directive('refField', require('./directives/refField'));
adminApp.directive('refManyField', require('./directives/refManyField'));
adminApp.directive('maChoicesFieldTags', require('./directives/maChoicesFieldTags'));
adminApp.directive('maChoicesFieldNew', require( './directives/maChoisesFiledNew'));
adminApp.directive('maRefManyFieldTags', require('./directives/maRefManyFieldTags'));
adminApp.directive('maColorPicker', require('./directives/maColorPicker'));
adminApp.directive('partnership', require('./directives/partnership'));
adminApp.directive('tagGif', require('./directives/tagGif'));
adminApp.directive('gifModerate', require('./gifs/gif-moderate'));

//State providers
adminApp.config(['$stateProvider', require('./statistics/stickers/config')]);
adminApp.config(['$stateProvider', require('./image-resize/config')]);

adminApp.config(['NgAdminConfigurationProvider', function (nga) {
    // create the admin application
    var admin = nga.application('My First Admin')
        .baseApiUrl(config.baseUrl);

    var users = nga.entity('users').identifier(nga.field('_id'));
    admin.addEntity(users);

    var tags = nga.entity('tags').identifier(nga.field('_id'));
    admin.addEntity(tags);

    var categories = nga.entity('categories').identifier(nga.field('_id'));
    admin.addEntity(categories);


    var products = nga.entity('products').identifier(nga.field('_id'));
    admin.addEntity(products);

    // configure entities
    require('./users/config')(nga, admin);
    require('./tags/config')(nga, admin);
    require('./category/config')(nga, admin);
    require('./products/config')(nga, admin);

    admin.dashboard(require('./dashboard/config')(nga, admin));
    admin.header(require('./header.html'));
    admin.menu(require('./menu')(nga, admin));

    // attach the admin application to the DOM and execute it
    nga.configure(admin);
}]);

adminApp.filter('bytes', function () {
    return function (bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes) || bytes == 0) return '0';
        if (typeof precision === 'undefined') precision = 1;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    }
});
