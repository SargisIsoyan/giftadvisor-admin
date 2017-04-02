var moment = require('moment');
var fromNow = v => moment(v).fromNow();

export default function (nga, admin) {

    return nga.dashboard();
        
}
