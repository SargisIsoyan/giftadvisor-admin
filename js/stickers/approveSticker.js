function approveSticker(Restangular, $state, notification) {
    'use strict';
    return {
        restrict: 'E',
        scope: {
            review: "&",
            size: "@",
        },
        link: function(scope, element, attrs) {
            scope.review = scope.review();
            scope.type = attrs.type;
            scope.approve = function(status) {
                Restangular
                    .one(scope.type, scope.review.values._id)
                    .all('status')
                    .post({status:status})
                    .then(() => $state.reload())
                    .then(() => notification.log(scope.type+' ' + status, { addnCls: 'humane-flatty-success' }) )
                    .catch(e => notification.log('A problem occurred, please try again', { addnCls: 'humane-flatty-error' }) && console.error(e) )
            }
        },
        template:
` <a ng-if="review.values.status == 'pending'" class="btn btn-outline btn-success" ng-class="size ? \'btn-\' + size : \'\'" ng-click="approve('approved')">
    <span class="glyphicon glyphicon-thumbs-up" aria-hidden="true"></span>&nbsp;Approve
</a>
<a ng-if="review.values.status == 'pending'" class="btn btn-outline btn-danger" ng-class="size ? \'btn-\' + size : \'\'" ng-click="approve('rejected')">
    <span class="glyphicon glyphicon-thumbs-down" aria-hidden="true"></span>&nbspReject
</a>`
    };
}
approveSticker.$inject = ['Restangular', '$state', 'notification'];

export default approveSticker;
