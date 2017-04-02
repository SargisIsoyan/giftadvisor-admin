const zoomInModal = ($uibModal) => {
    return {
        restrict: 'E',
        scope: {
            thumbnail: "@",
            image: "@"
        },
        link: (scope,element,attr) => {
            scope.cssClass ="poster_mini_thumbnail";
            if (attr.class) {
                scope.cssClass = attr.class;
            }
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
            `<img ng-src="{{ thumbnail }}" class="{{cssClass}}" ng-click="zoomThumbnail($event)"/>`
    };
}

zoomInModal.$inject = ['$uibModal'];

export default zoomInModal;
