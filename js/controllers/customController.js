/**
 * Created by sargis on 11/16/16.
 */
var config = require('./../../config');

export default function (adminApp) {
    adminApp.controller('customformController', ['$scope', '$state', 'Restangular', 'notification', 'progression',
        function ($scope, $state, Restangular, notification, progression) {
            var requiredFields = ['name.hy', 'name.en', 'category', 'tags', 'price', 'main_iamge', 'images_zip'];
            var requiredEditionFields = ['name', 'description', 'owner', 'tags', 'price', 'pg'];
            $scope.submitCreation = function ($event) {
                $event.preventDefault();
                progression.start();
                var formData = new FormData();
                var Ok = true;
                Object.keys($scope.entry.values).forEach((key) => {
                    var item = $scope.entry.values[key];
                    if ((item == null || typeof item == "undefined") && requiredFields.indexOf(key) > -1) {
                        notification.log(`Fill ` + key, {addnCls: 'humane-flatty-error'});
                        progression.done();
                        Ok = false;
                        return;
                    } else if (item != null) {
                        formData.append(key, (typeof item == "object" && key == 'additional_fields') ? angular.toJson(item) : item);
                    }
                });

                if (Ok) {
                    Restangular
                        .all($scope.entry.entityName)
                        .withHttpConfig({transformRequest: angular.identity})
                        .customPOST(formData, undefined, undefined,
                            {'Content-Type': undefined})
                        .then((response) => {
                            progression.done();
                        })
                        .then(() => {
                            notification.log('Upload Complete ', {addnCls: 'humane-flatty-success'})
                            $state.go($state.get('list'), {entity: $scope.entity.name()});
                        })
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
                }
            };

            $scope.submitEdition = function ($event) {
                $event.preventDefault();
                progression.start();
                var formData = new FormData();
                var Ok = true;
                var fields = ["name.en", "name.hy", "description.en", "description.hy", "category", "tags", "price", "old_price", 'additional_fields'];
                Object.keys(fields).forEach((key) => {
                    var item = $scope.entry.values[fields[key]];
                    if ((item == null || typeof item == "undefined") && requiredEditionFields.indexOf(fields[key]) > -1 && fields[key] != 'old_price') {
                        notification.log(`Fill ` + fields[key], {addnCls: 'humane-flatty-error'});
                        progression.done();
                        Ok = false;
                        return;
                    } else if (typeof item != "undefined" && item != null) {
                        formData.append(fields[key], (typeof item == "object" && fields[key] == 'additional_fields') ? angular.toJson(item) : item);
                    }
                });
                if (Ok) {
                    Restangular
                        .one($scope.entry.entityName, $scope.entry.identifierValue)
                        .withHttpConfig({transformRequest: angular.identity})
                        .customPUT(formData, undefined, undefined,
                            {'Content-Type': undefined})
                        .then((response) => {
                            progression.done();
                        })
                        .then(() => notification.log('Edit Complete ', {addnCls: 'humane-flatty-success'}))
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

                        })
                }
            };

            $scope.onFileSelect = function ($files, field) {
                if (field in $scope.entry.values) {
                    $scope.entry.values[field] = $files[0];
                }
            };

        }]);
};