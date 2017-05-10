function fileField(Restangular, $state, notification) {
    'use strict';
    return {
        restrict: 'E',
        scope: {
            field: "&",
            thumbnail: "@",
            imagename: "@",
            multiple: "@",
            size: "@",
        },
        link: function (scope, element, attrs) {
            scope.fieldName = attrs.field;
            scope.type = attrs.type;
            scope.popoxakan = false;
            scope.onFileSelect = function ($files) {
                if ($files && $files[0]) {
                    scope.uploadFileName = $files[0].name;
                    var formData = new FormData();
                    formData.append(scope.fieldName, $files[0]);
                    scope.popoxakan = true;
                    Restangular
                        .one(scope.$parent.entry.entityName, scope.$parent.entry.identifierValue)
                        .all('upload')
                        .withHttpConfig({transformRequest: angular.identity})
                        .customPOST(formData, undefined, undefined,
                            {'Content-Type': undefined})
                        .then((response) => {
                            scope.thumbnail = response.data[scope.fieldName]['src'];
                            scope.popoxakan = false;
                        })
                        .then(() => notification.log('Upload Complete ', {addnCls: 'humane-flatty-success'}))
                        .catch(e => {
                            notification.log('A problem occurred, please try again', {addnCls: 'humane-flatty-error'});
                            console.error(e);
                            scope.popoxakan = false;
                        })
                }
            };

        },
        template: `<div class="row">
  <div class="col-md-2">
<button
    class="btn btn-default"
    ngf-select
    ngf-change="onFileSelect($files)"
    ngf-multiple="{{multiple}}"
>Upload</button>
</div>
  <div class="col-md-8">
<p ng-show="!popoxakan">{{imagename }}</p>
<img src="images/loading.gif" width="40px" ng-show="popoxakan"/>
  </div>
  <div class="col-md-2" ng-if="type=='image'">
  <img ng-src="{{ thumbnail }}" class="poster_mini_thumbnail" ng-show="!popoxakan"/>
  </div>
</div>
`
    };
}
fileField.$inject = ['Restangular', '$state', 'notification'];

export default fileField;
