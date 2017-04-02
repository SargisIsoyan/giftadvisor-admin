/**
 * Created by sargis on 2/8/17.
 */
export default function (adminApp) {
    var FileSaver = require('file-saver');
    adminApp.controller('imageResizeController', ['$scope', '$state', 'Restangular', 'notification', 'progression',
        function ($scope, $state, Restangular, notification, progression) {
            $scope.image = null;
            $scope.onFileSelect = function ($files) {
                if ($files && $files[0]) {
                    $scope.image  = $files[0];
                }
            };
            $scope.uploadImage = function ($event) {
                $event.preventDefault();
                progression.start();
                if ($scope.image) {
                    var formData = new FormData();
                    formData.append('image',$scope.image);
                    Restangular
                        .one('image-resize')
                        
                        // .customPOST(formData, undefined, undefined,
                        //     {'Content-Type': undefined})
                        .get()
                        .then(function(response){
                            //console.log(response);
                            // var file = new Blob([response], { type: 'image/png' });
                            // FileSaver.saveAs(file, '7PmvvFC8n3YYvm4ImV9jIpSv.png');
                            // var fileName = 'output.png';
                            // var a = document.createElement('a');
                            // document.body.appendChild(a);
                            // a.style = 'display: none';
                            // var file = new Blob([response], {type: 'image/png'});
                            // var fileURL = (window.URL || window.webkitURL).createObjectURL(file);
                            // a.href = fileURL;
                            // a.download = fileName;
                            // a.click();
                            // (window.URL || window.webkitURL).revokeObjectURL(file);
                             progression.done();
                        })
                        .catch(error => {
                            progression.done();
                            var error_message = 'Something went wrong.';
                            if (error.data.message) {
                                error_message = error.data.message;
                            }
                            notification.log(error_message, {addnCls: 'humane-flatty-error'});
                            return false;
                        });
                }else {
                    progression.done();
                    notification.log("Select Image", {addnCls: 'humane-flatty-error'});
                    return false;
                }
            }
        }]);
};