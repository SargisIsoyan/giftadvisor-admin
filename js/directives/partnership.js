/**
 * Created by sargis on 11/23/16.
 */
import DateField from "admin-config/lib/Field/DateField";
import parnershipTemplate from "./../creators/partnershipTemplate.html";
import moment from 'moment';
var parseDate = v => {
    return (v)?moment(v.toString()).format("YYYY-MM-DD"):v;
}
const partnership = () => {
    return {
        restrict: 'E',
        scope: {
            entry:"="
        },
        link: {
            pre:(scope) => {
                scope.partnership = scope.entry.values.partnership;
                scope.startDate = new DateField("start_date");
                scope.endDate = new DateField("end_date");
                scope.partnership.start_date = parseDate(scope.partnership.start_date);
                scope.partnership.end_date = parseDate(scope.partnership.end_date);


            }
        },
        template:parnershipTemplate
    };
}

partnership.$inject = [];

export default partnership;
