/**
 * Created by sargis on 4/2/16.
 */
var config = require('./../../config');

export default function (adminApp) {
    adminApp.controller('authController', ['$scope', '$window', '$http', function ($scope, $window, $http) {
        $scope.username = "Admin";
        $scope.login = function () {
            var data = {
                email: $scope._email,
                password: $scope._password
            };
            var reqConfig = {
                headers: {
                }
            };
            $http.post(config.baseUri + "auth/login", data, reqConfig)
                .success(function (data, status, headers, config) {
                    console.log(data);
                    if (data.data && data.data.token) {
                        $scope.accessToken = $window.localStorage.setItem('access-token', data.data.token);
                        window.location.href = "./index.html";
                    }
                })
                .error(function (data, status, header, config) {
                    $scope.message = data.message;
                    if (data.details) {
                        $scope.details = data.details[0].message;
                    }
                });
        };
        $scope.logout = function () {
            var headers = {
                'x-access-token': window.localStorage.getItem('access-token')
            };
            $http({
                method: 'GET',
                url: config.baseUrl + "logout",
                headers: headers
            }).success(function (data, status, headers, config) {
                window.localStorage.removeItem('access-token');
                window.location.href = "./login.html";
            }).error(function (data, status, header, config) {
                alert(data.message);
            });
        };
    }]);
}