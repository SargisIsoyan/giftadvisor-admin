/**
 * Created by sargis on 11/30/16.
 */
function gifModerate(Restangular, $state, notification) {
    'use strict';
    return {
        restrict: 'E',
        scope: {
            gif: "&",
            size: "@",
        },
        link: function(scope, element, attrs) {
            scope.gif = scope.gif();
            scope.approve = function(status) {
                Restangular
                    .one("gifs", scope.gif.values._id)
                    .all('status')
                    .post({status:status})
                    .then(() => $state.reload())
                    .then(() => notification.log('Gif ' + status, { addnCls: 'humane-flatty-success' }) )
                    .catch(e => notification.log('A problem occurred, please try again', { addnCls: 'humane-flatty-error' }) && console.error(e) )
            }
        },
        template:
            ` <a ng-if="gif.values.status == 'pending'" class="btn btn-outline btn-success" ng-class="size ? \'btn-\' + size : \'\'" ng-click="approve('moderated')">
    <span class="glyphicon glyphicon-thumbs-up" aria-hidden="true"></span>&nbsp;Approve
</a>`
    };
}
gifModerate.$inject = ['Restangular', '$state', 'notification'];

export default gifModerate;