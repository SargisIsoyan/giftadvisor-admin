function activateCreator(Restangular, $state, notification) {
    'use strict';
    return {
        restrict: 'E',
        scope: {
            review: "&",
            size: "@",
        },
        link: function (scope, element, attrs) {
            scope.review = scope.review();
            scope.type = attrs.type;
            scope.activate = function (status) {
                Restangular
                    .one('creator', scope.review.values._id)
                    .all('status')
                    .post({status:status})
                .then(() => $state.reload())
                .then(() => notification.log('Creator ' + status, { addnCls: 'humane-flatty-success' }) )
                .catch(e => notification.log('A problem occurred, please try again', { addnCls: 'humane-flatty-error' }) && console.error(e) )
            }
        },
        template: ` <a ng-if="review.values.status == 'inactive'" class="btn btn-outline btn-success" ng-class="size ? \'btn-\' + size : \'\'" ng-click="activate('active')">
    <span class="glyphicon glyphicon-thumbs-up" aria-hidden="true"></span>&nbsp;Activate
</a>
<a ng-if="review.values.status == 'active'" class="btn btn-outline btn-danger" ng-class="size ? \'btn-\' + size : \'\'" ng-click="activate('inactive')">
    <span class="glyphicon glyphicon-thumbs-down" aria-hidden="true"></span>&nbspReject
</a>`
    };
}
activateCreator.$inject = ['Restangular', '$state', 'notification'];

export default activateCreator;
