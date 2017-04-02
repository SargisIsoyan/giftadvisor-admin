/**
 * Created by sargis on 11/25/16.
 */
import Entry from 'admin-config/lib/Entry';
const tagGif = ($uibModal, Restangular, $document) => {
    return {
        restrict: 'E',
        scope: {
            'value': '=',
            'entry': '=',
            'datastore': '&?',
            'field': "&"
        },
        link: {
            pre: (scope , element , attr) => {
                console.log();
                const tag_id = scope.entry._identifierValue;
                const field = scope.field();
                const identifierName = field.targetEntity().identifier().name();
                const refresh = ()=> {
                    scope.gif = scope.datastore()
                        .getEntries(field.targetEntity().uniqueId + '_values')
                        .find(entry => entry.values[identifierName] == scope.value);
                    scope.gif = (scope.gif) ? scope.gif.transformToRest([field]) : scope.gif;
                };
                scope.$watch("value", function (value) {
                    refresh();
                });
                var filter = {};
                filter[attr.for] = [tag_id];
                var gifParams = {
                    "order_by": "popular",
                    "filter": angular.toJson(filter),
                    "limit": 20
                };
                scope.gifs = [];
                const getRemoteGifs = ()=> {
                    Restangular.all('gifs')
                        .getList(gifParams).then((response)=> {
                        if (response.next) {
                            scope.next = response.next;
                        } else {
                            delete scope.next;
                        }
                        scope.gifs = scope.gifs.concat(response.data);
                        return response.data;
                    }).then((gifs)=> {
                        gifs.forEach((gifItem)=> {
                            scope.datastore().addEntry(
                                field.targetEntity().uniqueId + '_values',
                                new Entry(field.targetEntity().name(),
                                    gifItem, gifItem[identifierName]
                                )
                            );
                        });
                    });
                };

                scope.next = null;
                scope.zoomThumbnail = ($event) => {
                    $event.preventDefault();
                    scope.loading = {};
                    if (scope.gifs.length == 0) {
                        getRemoteGifs();
                    }
                    $uibModal.open({
                        backdrop: true,
                        scope: scope,
                        size: "lg",
                        controller: ['$scope', '$uibModalInstance', ($scope, $uibModalInstance) => {
                            $scope.close = () => $uibModalInstance.close();
                            $scope.hover = (gif)=> {
                                $scope.loading[gif._id] = true;
                                var img = new Image();
                                img.src = gif.gif_small.image;
                                img.onload = ()=> {
                                    angular.element("#image-" + gif._id)
                                        .attr("ng-src", img.src)
                                        .attr("src", img.src);
                                };
                            };
                            $scope.hoverOut = (gif)=> {
                                $scope.loading[gif._id] = false;
                                angular.element("#image-" + gif._id)
                                    .attr("ng-src", gif.first_frame_small.image)
                                    .attr("src", gif.first_frame_small.image);
                            };
                            $scope.selectGif = (gif)=> {
                                scope.value = gif._id;
                                $scope.close();
                            };
                            $scope.loadMore = ()=> {
                                gifParams.page = $scope.next.page;
                                getRemoteGifs();
                            };
                        }],
                        template: `<div class="modal-header">Popular 20 gifs for this tag</div>
                        <div class="modal-body">
                            <div masonry='{ "transitionDuration" : "0.4s" , "itemSelector" : ".gifForSelect"}'>
                            <div masonry-tile ng-repeat="gif in gifs" class="gifForSelect" 
                                ng-mouseover="hover(gif)" ng-mouseleave="hoverOut(gif)" ng-click="selectGif(gif)">
                                <img  id="image-{{gif._id}}" ng-src="{{ gif.first_frame_small.image }}" />
                                <div class="loading-bar" ng-show="loading[gif._id]">
                                    <div class="loading-bar-inner">
                                        <div class="bar"></div>
                                        <div class="bar"></div>
                                        <div class="bar"></div>
                                    </div>
                                </div>
                            </div>
                            </div>
                            <button ng-show="next" ng-click="loadMore()" class="btn btn-default" >
                                Load More
                            </button>
                        </div>
                        <div class="modal-footer">
                            <button ng-click="close()" class="btn btn-success" >
                                Close
                            </button>
                        </div>`
                    });
                };

            }
        },
        template: `<div class="row">
                      <div class="col-md-2">
                        <button class="btn btn-default" ng-click="zoomThumbnail($event)">Select Gif</button>
                      </div>
                      <div class="col-md-8"> 
                         <zoom-in-modal class="gifSelectImage" thumbnail="{{ gif.first_frame_small.image }}" image="{{ gif.webp.image }}"></zoom-in-modal>
                         <p>{{ gif.name}}</p>
                      </div>
                  </div>`
    };
}

tagGif.$inject = ['$uibModal', 'Restangular', '$document'];

export default tagGif;
