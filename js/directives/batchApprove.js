function batchApprove(Restangular, $q, notification, $state) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            selection: '=',
            type: '@'
        },
        link: function (scope, element, attrs) {
            const status = attrs.type == 'active' ? 'active' : 'inactive';
            scope.icon = attrs.type == 'active' ? 'glyphicon-thumbs-up' : 'glyphicon-thumbs-down';
            scope.label = attrs.type == 'active' ? 'Activate' : 'Inactivate';
            scope.updateStatus = function () {
                $q.all(scope.selection.map(e => {
                    return Restangular.one(e.entityName, e.values._id).customPUT({status: status});
                }))
                    .then(() => $state.reload())
                    .then(() => notification.log(scope.selection.length + ' tags ' + scope.label, {addnCls: 'humane-flatty-success'}))
                    .catch(e => notification.log('A problem occurred, please try again', {addnCls: 'humane-flatty-error'}) && console.error(e))
            }
        },
        template: ` <span ng-click="updateStatus()"><span class="glyphicon {{ icon }}" aria-hidden="true"></span>&nbsp;{{ label }}</span>`
    };
}

batchApprove.$inject = ['Restangular', '$q', 'notification', '$state'];

export default batchApprove;