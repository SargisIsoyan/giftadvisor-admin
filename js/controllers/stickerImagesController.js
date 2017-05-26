/**
 * Created by sargis on 11/16/16.
 */
var config = require('./../../config');

export default function (adminApp) {
    adminApp.controller('stickerImages', ['$scope', '$rootScope', '$state', 'Restangular', 'notification', 'progression',
        function ($scope, $root, $state, Restangular, notification, progression) {
            if ($root.stickerImageFiles == undefined) {
                $root.stickerImageFiles = {};
            }
            $scope.saveImages = function ($event) {
                $event.preventDefault();
                progression.start();
                var formData = new FormData();
                var images = $scope.entry.values.images;
                console.log(images);
                try {
                    images.forEach((image) => {
                        if (image._id == undefined || image._id == null) {
                            if (typeof image.src == "string" && $root.stickerImageFiles[image.src]) {
                                formData.append('image-'+image.src,$root.stickerImageFiles[image.src]);
                            }
                        }
                    });
                    formData.append('product_id', $scope.entry.identifierValue);
                    formData.append('images',angular.toJson(images));

                    Restangular
                        .one($scope.entry.entityName, $scope.entry.identifierValue)
                        .all('images')
                        .withHttpConfig({transformRequest: angular.identity})
                        .customPOST(formData, undefined, undefined,
                            {'Content-Type': undefined})
                        .then((response) => {
                            progression.done();
                        })
                        .then(() => notification.log('Edit Complete ', {addnCls: 'humane-flatty-success'})
                        && $state.reload() )
                        .catch(error => {
                            progression.done();
                            var error_message = 'Something went wrong.';
                            if (error.data.message) {
                                error_message = error.data.message;
                            }
                            if (error.data.error_info) {
                                error_message += error.data.error_info;
                            }
                            if (error.data.details) {
                                error.data.details.forEach(violation => {
                                    if (form[violation.path]) {
                                        form[violation.path].$valid = false;
                                        error_message += violation.message;
                                    }
                                });
                            }
                            progression.done();
                            notification.log(error_message, {addnCls: 'humane-flatty-error'});
                            return false;

                        });
                } catch ($e) {

                }
            };

            $scope.onStickerImageSelect = function ($files) {
                if ($files && $files[0]) {
                    var key = Date.now().toString() ;
                    $root.stickerImageFiles[key] = $files[0];
                    $scope.entry.values.name = $files[0].name;
                    $scope.entry.values.src = key;
                } else {
                    $scope.entry.values.name = '';
                }
            };
        }]);
};
