/**
 * Created by sargis on 2/8/17.
 */

import imageResizeTemplate from './image-resize.html';

export default function ($stateProvider) {
    $stateProvider.state('image-resize', {
        parent: 'main',
        url: '/image-resize',
        controller: 'imageResizeController',
        template: imageResizeTemplate
    });
};
