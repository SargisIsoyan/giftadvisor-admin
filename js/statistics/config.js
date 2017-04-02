/**
 * Created by sargis on 11/23/16.
 */

import segmentsTemplate from './segmentsTemplate.html';
import statisticsController from '../controllers/stickerStatisticsController';

export default function ($stateProvider) {
    $stateProvider.state('statistics', {
        parent: 'main',
        url: '/statistics/:type',
        params: { type:null},
        controller: statisticsController,
        template: segmentsTemplate
    });
};
