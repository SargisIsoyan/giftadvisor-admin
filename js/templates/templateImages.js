/**
 * Created by sargis on 10/27/16.
 */
import imagePosition from './imagePosition.html'
const templateImages = ($uibModal, Restangular, $state, notification) => {
    return {
        restrict: 'E',
        scope: {
            thumbnail: "@",
            image: "=",
            template: "&"
        },
        link: (scope) => {
            scope.template = scope.template();
            scope.zoomThumbnail = ($event) => {
                $event.preventDefault();
                $uibModal.open({
                    backdrop: true,
                    scope: scope,
                    controller: ['$scope', '$uibModalInstance', ($scope, $uibModalInstance) => {
                        console.log();
                        $scope.calculations = JSON.stringify(scope.template.values.positions);
                        $scope.close = () => $uibModalInstance.close();
                        $scope.save = () => {
                            Restangular
                                .one('template', scope.template.identifierValue)
                                .all('positions')
                                .post({positions: JSON.parse($scope.calculations)})
                                .then((response) => {
                                    scope.template.values.positions = JSON.parse($scope.calculations);
                                })
                                .then(() => notification.log('Position updated', {addnCls: 'humane-flatty-success'}) && $uibModalInstance.close())
                                .catch(e => notification.log('A problem occurred, please try again', {addnCls: 'humane-flatty-error'}) && console.error(e))
                        };
                        $uibModalInstance.rendered.then(()=> {
                            var imgWidth, W = 351;
                            var landmarkPoint5 = $('#mainpoint5');
                            var landmarkPoint11 = $('#mainpoint11');
                            var landmarkPoint36 = $('#mainpoint36');
                            var landmarkPoint45 = $('#mainpoint45');
                            var position = {
                                width: null,
                                height: null,
                                top: null,
                                left: null,
                                '5': null,
                                '11': null,
                                '36': null,
                                '45': null,
                                '36to45': null,
                                '36to5': null,
                            };
                            if ($(".calculations").val().length > 0) {
                                position = JSON.parse($(".calculations").val());
                                $("#mainZoomCont .resizeDiv").css({
                                    top: position.top * W,
                                    left: position.left * W
                                });
                            }


                            function updatePosition() {
                                position.width = imgWidth / W;
                                position.height = $("#mainZoomCont .resizeDiv").height() / W;
                                var contTop = $("#mainZoomCont").position().top;
                                var contLeft = $("#mainZoomCont").position().left;
                                var imgTop = $("#mainZoomCont .resizeDiv").position().top;
                                var imgLeft = $("#mainZoomCont .resizeDiv").position().left;
                                position.top = (imgTop - contTop) / W;
                                position.left = (imgLeft - contLeft) / W;
                                position['5'] = {
                                    top: (landmarkPoint5.position().top - contTop) / W,
                                    left: (landmarkPoint5.position().left - contLeft) / W,
                                };
                                position['11'] = {
                                    top: (landmarkPoint11.position().top - contTop) / W,
                                    left: (landmarkPoint11.position().left - contLeft) / W,
                                };
                                position['36'] = {
                                    top: (landmarkPoint36.position().top - contTop) / W,
                                    left: (landmarkPoint36.position().left - contLeft) / W,
                                };
                                position['45'] = {
                                    top: (landmarkPoint45.position().top - contTop) / W,
                                    left: (landmarkPoint45.position().left - contLeft) / W,
                                };
                                position['36to45'] = (landmarkPoint45.position().left - landmarkPoint36.position().left) / W;
                                position['36to5'] = (landmarkPoint5.position().top - landmarkPoint36.position().top) / W;
                                $(".calculations").val(JSON.stringify(position));
                                $(".calculations").trigger('input');
                                return position;
                            };

                            $('#mainZoomCont .resizeDiv')
                                .draggable({
                                    stop: function (event, ui) {
                                        console.log(updatePosition());
                                    }
                                });
                            imgWidth = $("#mainZoomCont .resizeDiv").width() * 0.24375;
                            $("#mainZoomCont .resizeDiv").attr('width', imgWidth);
                        });

                    }],
                    template: imagePosition,
                });
            };

        },
        template: `<img ng-src="{{ thumbnail }}" class="template_image" ng-click="zoomThumbnail($event)"/>`
    };
}

templateImages.$inject = ['$uibModal', 'Restangular', '$state', 'notification'];

export default templateImages;
