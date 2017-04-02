const zoomInSticker = ($uibModal) => {
    return {
        restrict: 'E',
        scope: {
            thumbnail: "@",
            image: "@",
        },
        link: (scope) => {
            scope.zoomThumbnail = ($event) => {
                $event.preventDefault();
                $uibModal.open({
                    backdrop: true,
                    scope: scope,
                    controller: ['$scope', '$uibModalInstance', ($scope, $uibModalInstance) => {
                        $scope.close = () => $uibModalInstance.close();
                    }],
                    template:
                        `<div class="modal-body">
                            <img ng-src="{{ image }}" class="img-thumbnail img-responsive"/>
                        </div>
                        <div class="modal-footer">
                            <button ng-click="close()" class="btn btn-success" >
                                Close
                            </button>
                        </div>`
                });
            }
        },
        template:
            `<img ng-src="{{ thumbnail }}" class="template_image" ng-click="zoomThumbnail($event)"/>`
    };
}

zoomInSticker.$inject = ['$uibModal'];

export default zoomInSticker;
