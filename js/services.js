/**
 * Created by sargis on 10/6/16.
 */
adminApp.service(
    "Session",
    function (USER_ROLES) {
        var self = this;

        self.userAccessToken = Cookies.get("userAccessToken");

        self.create = function (userAccessToken, userId, userRole) {
            self.userAccessToken = userAccessToken;
            self.userId = userId;
            self.userRole = userRole;

            if (userAccessToken) {
                Cookies.set("userAccessToken", userAccessToken);
            }
            else {
                Cookies.expire("userAccessToken");
            }
        };
        self.destroy = function () {
            self.userAccessToken = null;
            self.userId = null;
            self.userRole = USER_ROLES.guest;

            Cookies.expire("userAccessToken");
        }
    }
);

adminApp.factory(
    "AuthInterceptor",
    ["$rootScope", "$q", "AUTH_EVENTS", function ($rootScope, $q, AUTH_EVENTS) {
        var eventsMap = {
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
        };

        return {
            responseError: function (response) {
                if (eventsMap[response.status]) {
                    $rootScope.$broadcast(eventsMap[response.status], response);
                }

                return $q.reject(response);
            }
        };
    }]
);

adminApp.factory(
    "MainInterceptor",
    ["$q", "Session", function MainInterceptor($q, Session) {
        return {
            request: function (config) {
                angular.extend(config.headers, {
                    "x-key": Config.apiKey
                });
                if (Session.userAccessToken) {
                    angular.extend(config.headers, {
                        "x-access-token": Session.userAccessToken
                    });
                }

                return config;
            },
            response: function (response) {
                var result = null,
                    message;

                // TODO: to support some request with nested responses, remove when fixed
                if (response.data && angular.isDefined(response.data.status)) {
                    response = response.data;
                }

                if ([200, 304].indexOf(response.status) != -1) {
                    result = {
                        success: true,
                        data: response.data
                    };
                }
                else {
                    if (response.message) {
                        message = response.message;
                    }
                    else if (response.messages) {
                        message = response.messages[0];
                    }
                    else if (angular.isArray(response.details) && response.details.length) {
                        message = response.details[0].message;
                    }

                    result = {
                        success: false,
                        message: message
                    };
                }

                return result;
            },
            responseError: function (response) {
                var result,
                    message;

                // TODO: to support some request with nested responses, remove when fixed
                if (response.data && angular.isDefined(response.data.status)) {
                    response = response.data;
                }

                if (response.message) {
                    message = response.message;
                }
                else if (response.messages) {
                    message = response.messages[0];
                }
                else if (angular.isArray(response.details) && response.details.length) {
                    message = response.details[0].message;
                }

                result = {
                    success: false,
                    message: message
                };

                return $q.reject(result);
            }
        }
    }]
);

adminApp.config(["$httpProvider", "$authProvider", function ($httpProvider, $authProvider) {
    $httpProvider.interceptors.push("AuthInterceptor");
    $httpProvider.interceptors.push("MainInterceptor");

    // config for login with fb/google
    $authProvider.httpInterceptor = function (request) {
        request.headers["x-key"] = Config.apiKey;

        return request;
    };
    $authProvider.facebook({
        clientId: Config.fbAppId,
        url: Config.apiEndpoint + "auth/facebook",
        redirectUri: Config.appUrl
    });
    $authProvider.google({
        clientId: Config.googleAppId,
        url: Config.apiEndpoint + "auth/google",
        redirectUri: Config.appUrl
    })
}]);


// to send data as FormData key value pairs not json. fix from http://www.bennadel.com/blog/2615-posting-form-data-with-http-in-angularjs.htm
adminApp.factory(
    "transformRequestAsFormPost",
    [function () {
        function transformRequest(data, getHeaders) {
            var headers = getHeaders();
            headers["Content-type"] = "application/x-www-form-urlencoded; charset=utf-8";
            return ( serializeData(data) );
        }

        function serializeData(data) {
            if (!angular.isObject(data)) {
                return ( ( data == null ) ? "" : data.toString() );
            }

            var buffer = [];
            angular.forEach(data, function (value, key) {
                buffer.push(
                    encodeURIComponent(key) +
                    "=" +
                    encodeURIComponent(( value == null ) ? "" : angular.isObject(value) ? angular.toJson(value) : value)
                );
            });

            return buffer.join("&").replace(/%20/g, "+");
        }

        return ( transformRequest );
    }]
);

adminApp.factory(
    "Requester",
    ["$http", "$q", "transformRequestAsFormPost", function Requester($http, $q, transformRequestAsFormPost) {
        function sendRequest(config, responseModifier) {
            var deferred = $q.defer(),
                cancelRequestPromise = $q.defer(),
                aborted = false;

            angular.extend(config, {
                timeout: cancelRequestPromise.promise
            });

            $http(config).then(
                function (response) {
                    if (responseModifier) {
                        response = responseModifier(response);
                    }

                    deferred.resolve(response);
                },
                function (response) {
                    if (responseModifier) {
                        response = responseModifier(response);
                    }

                    deferred.resolve(response);
                }
            );

            deferred.promise.abort = function () {
                aborted = true;
                cancelRequestPromise.resolve();
            };
            deferred.promise.finally(function () {
                deferred.promise.abort = angular.noop;
                deferred = null;

                cancelRequestPromise = null;
            });

            return deferred.promise;
        }

        function apiGet(endpoint, queryParams, responseModifier) {
            var config;

            config = {
                url: Config.apiEndpoint + endpoint,
                method: "get",
                dataType: "jsonp",
                params: angular.extend({}, queryParams)
            };

            return sendRequest(config, responseModifier);
        }

        function apiPost(endpoint, queryParams, data, containsFile, responseModifier) {
            var config;

            config = {
                url: Config.apiEndpoint + endpoint,
                method: "post",
                dataType: "jsonp",
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                params: angular.extend({}, queryParams),
                data: data,
                transformRequest: transformRequestAsFormPost
            };

            if (containsFile) {
                config.headers["content-type"] = undefined;
                config.transformRequest = null;
            }

            return sendRequest(config, responseModifier);
        }

        function apiPut(endpoint, queryParams, data, containsFile, responseModifier) {
            var config;

            config = {
                url: Config.apiEndpoint + endpoint,
                method: "put",
                dataType: "jsonp",
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                params: angular.extend({}, queryParams),
                data: data,
                transformRequest: transformRequestAsFormPost
            };

            if (containsFile) {
                config.headers["content-type"] = undefined;
                config.transformRequest = null;
            }

            return sendRequest(config, responseModifier);
        }

        function apiPatch(endpoint, queryParams, data, containsFile, responseModifier) {
            var config;

            config = {
                url: Config.apiEndpoint + endpoint,
                method: "patch",
                dataType: "jsonp",
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                params: angular.extend({}, queryParams),
                data: data,
                transformRequest: transformRequestAsFormPost
            };

            if (containsFile) {
                config.headers["content-type"] = undefined;
                config.transformRequest = null;
            }

            return sendRequest(config, responseModifier);
        }

        function apiDelete(endpoint, queryParams, data, responseModifier) {
            var config;

            config = {
                url: Config.apiEndpoint + endpoint,
                method: "delete",
                dataType: "jsonp",
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                params: angular.extend({}, queryParams),
                data: data,
                transformRequest: transformRequestAsFormPost
            };

            return sendRequest(config, responseModifier);
        }

        return {
            apiGet: apiGet,
            apiPost: apiPost,
            apiPut: apiPut,
            apiPatch: apiPatch,
            apiDelete: apiDelete
        };
    }]
);

adminApp.factory(
    "AuthService",
    ["$q", "$state", "$auth", "USER_ROLES", "ROUTE_ERROR", "Requester", "Session", "UserService", function AuthService($q, $state, $auth, USER_ROLES, ROUTE_ERROR, Requester, Session, UserService) {
        return {
            signUp: function (data) {
                return Requester.apiPost("auth/registration", null, data);
            },
            signIn: function (data) {
                var deferred = $q.defer(),
                    userData;

                Requester.apiPost("auth/login", null, data).then(
                    function (response) {
                        if (response.success && response.data.token && response.data.token != "") {
                            userData = UserService.parseUserData(response.data["user-data"]);
                            Session.create(response.data.token, userData.id, userData.role);
                        }
                        else {
                            Session.destroy();
                        }

                        deferred.resolve(response);
                    },
                    function (response) {
                        deferred.resolve({
                            success: false,
                            message: response.message
                        });
                    }
                );

                return deferred.promise;
            },
            signInWithFB: function () {
                var deferred = $q.defer(),
                    userData;

                $auth.authenticate("facebook").then(
                    function (response) {
                        if (response.success && response.data.token && response.data.token != "") {
                            userData = UserService.parseUserData(response.data["user-data"]);
                            Session.create(response.data.token, userData.id, userData.role);
                        }
                        else {
                            Session.destroy();
                        }

                        deferred.resolve(response);
                    },
                    function (response) {
                        var responseMessage = "";

                        if (response.error) {
                            // Popup error - invalid redirect_uri, pressed cancel button, etc.
                            responseMessage = response.error;
                        }
                        else if (response.data) {
                            // HTTP response error from server
                            responseMessage = response.data.message;
                        }
                        else {
                            responseMessage = response;
                        }

                        deferred.resolve({
                            success: false,
                            message: responseMessage
                        });
                    }
                );

                return deferred.promise;
            },
            signInWithGoogle: function () {
                var deferred = $q.defer(),
                    userData;

                $auth.authenticate("google").then(
                    function (response) {
                        if (response.success && response.data.token && response.data.token != "") {
                            userData = UserService.parseUserData(response.data["user-data"]);
                            Session.create(response.data.token, userData.id, userData.role);
                        }
                        else {
                            Session.destroy();
                        }

                        deferred.resolve(response);
                    },
                    function (response) {
                        var responseMessage = "";

                        if (response.error) {
                            // Popup error - invalid redirect_uri, pressed cancel button, etc.
                            responseMessage = response.error;
                        }
                        else if (response.data) {
                            // HTTP response error from server
                            responseMessage = response.data.message;
                        }
                        else {
                            responseMessage = response;
                        }

                        deferred.resolve({
                            success: false,
                            message: responseMessage
                        });
                    }
                );

                return deferred.promise;
            },
            signOut: function () {
                var deferred = $q.defer();

                Requester.apiGet("auth/logout").then(function (response) {
                    if (response.success) {
                        Session.destroy();

                        deferred.resolve(response);
                    }
                    else {
                        // TODO: handle sign out failed?
                    }
                });

                return deferred.promise;
            },
            isAuthenticated: function () {
                return !!Session.userId;
            },
            isAuthorized: function (authorizedRoles) {
                var isAuthorized = false;

                if (!angular.isArray(authorizedRoles)) {
                    authorizedRoles = [authorizedRoles];
                }

                if (authorizedRoles.indexOf(Session.userRole) != -1 || authorizedRoles.indexOf(USER_ROLES.all) != -1) {
                    isAuthorized = true;
                }

                return isAuthorized;
            },
            resolveUserState: function () {
                var deferred = $q.defer();

                if (Session.userRole) {
                    deferred.resolve();
                }
                else {
                    if (Session.userAccessToken) {
                        UserService.getUserData().then(function (response) {
                            if (response.success) {
                                Session.create(Session.userAccessToken, response.data.id, response.data.role);
                            }

                            deferred.resolve();
                        });
                    }
                    else {
                        Session.destroy();

                        deferred.resolve();
                    }
                }

                return deferred.promise;
            },
            resolveUserRouteAuthorization: function (state) {
                var self = this,
                    deferred = $q.defer(),
                    authorizedRoles;

                self.resolveUserState().then(function () {
                    authorizedRoles = state.data.authorizedRoles || USER_ROLES.all;

                    if (self.isAuthorized(authorizedRoles)) {
                        deferred.resolve();
                    }
                    else {
                        if (!self.isAuthenticated()) {
                            deferred.reject(ROUTE_ERROR.notAuthenticated);
                        }
                        else {
                            deferred.reject(ROUTE_ERROR.notAuthorized);
                        }
                    }
                });

                return deferred.promise;
            }
        }
    }]
);

adminApp.factory(
    "CommonService",
    ["$q", "Requester", function CommonService($q, Requester) {
        function countryListResponseModifier(response) {
            var countries = [];

            if (response.success) {
                angular.forEach(response.data, function (item) {
                    countries.push(parseCountryData(item));
                });

                response.data = countries;
            }

            return response;
        }

        function parseCountryData(countryData) {
            var country;

            country = {
                uid: Utils.generateUid(),
                code: countryData.code,
                name: countryData.name,
                dialCode: countryData.dial_code
            };

            return country;
        }

        return {
            getCountryList: function () {
                return Requester.apiGet("countries", null, countryListResponseModifier);
            }
        }
    }]
);

adminApp.factory(
    "UtilService",
    ["$q", "$timeout", function UtilService($q, $timeout) {
        var imageCache = {};

        return {
            loadImage: function (url) {
                var deferred = $q.defer(),
                    img;

                deferred.promise.cancel = function () {
                    deferred.reject();
                };
                deferred.promise.finally(function () {
                    if (img) {
                        img.onerror = img.onabort = img.onload = null;
                        img.src = "";
                        img = null;
                    }

                    deferred.promise.cancel = angular.noop;
                    deferred = null;
                });

                if (imageCache[url]) {
                    deferred.resolve(imageCache[url]);
                }
                else {
                    img = new Image();
                    img.onload = function () {
                        $timeout(function () {
                            var imageData = {
                                url: url,
                                width: img.width,
                                height: img.height
                            };

                            imageCache[url] = imageData;
                            deferred.resolve(imageData);
                        });
                    };
                    img.onerror = img.onabort = function () {
                        $timeout(function () {
                            if (deferred) {
                                deferred.resolve(null);
                            }
                        });
                    };

                    img.src = url;
                }

                return deferred.promise;
            },
            readFile: function (file) {
                var deferred = $q.defer(),
                    fileReader;

                deferred.promise.finally(function () {
                    if (fileReader) {
                        fileReader.onerror = fileReader.onload = null;
                        fileReader = null;
                    }
                    deferred = null;
                });

                fileReader = new FileReader();
                fileReader.onload = function (event) {
                    $timeout(function () {
                        deferred.resolve(event.target.result);
                    });
                };
                fileReader.onerror = function () {
                    $timeout(function () {
                        deferred.resolve(null);
                    });
                };

                fileReader.readAsDataURL(file);

                return deferred.promise;
            }
        }
    }]
);
