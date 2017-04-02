/**
 * Created by sargis on 11/23/16.
 */

import stickerStatTemplate from './template.html';

export default function ($stateProvider) {
    $stateProvider.state('stickerStatistics', {
        parent: 'main',
        url: '/statistics/sticker',
        params: { },
        controller: 'stickerStatisticsController',
        template: stickerStatTemplate
    });
};
