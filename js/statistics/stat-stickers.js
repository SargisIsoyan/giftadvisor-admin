/**
 * Created by sargis on 11/23/16.
 */
export default function (nga, admin) {

    var statistics = admin.getEntity('statistics');

    statistics.showView()
        .title('Statistics')
        .template(`aaaaaaaaaaaaa`);

    return statistics;
}