export default function (nga, admin) {
    const statuses = ['active', 'inactive'];
    const statusChoices = statuses.map(status => ({label: status, value: status}));
    var actions = admin.getEntity('actions');
    actions.listView()
        .title('Actions')
        .fields([
            nga.field('name') // use last_name for sorting
                .isDetailLink(true),
            nga.field('slug'),
            nga.field('rate', 'number'),
            nga.field('date_mod').template("<span >{{entry.values.date_mod | amDateFormat:'YYYY.MM.DD HH:mm:ss'}}</span>")
        ])
        .listActions([
            'edit',
            'delete'
        ])
        .filters([
            nga.field('q', 'template')
                .label('')
                .pinned(true)
                .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>'),
            nga.field('status', 'choice')
                .label('Status')
                .choices(statusChoices)
        ])
        .sortField('name')
        .sortDir('ASC');
    actions.creationView()

        .fields([
            nga.field('name').validation({required: true}),
            nga.field('slug')
                .editable(false)
        ])
        .onSubmitError(['error', 'form', 'progression', 'notification', function (error, form, progression, notification) {
            var error_message = '';
            if (error.data.message) {
                error_message = error.data.message;
            }
            if (error.data.details) {
                error.data.details.forEach(violation => {
                    if (form[violation.path]) {
                        form[violation.path].$valid = false;
                        error_message +=violation.message;
                    }
                });
            }

            progression.done();
            notification.log(`Some values are invalid. ` + error_message, {addnCls: 'humane-flatty-error'});
            return false;
        }]);
    
    actions.editionView()
        .title('{{ entry.values.name }}\'s details')
        .fields([actions.creationView().fields(),
            nga.field('rate', 'number'),
            nga.field('date_at','datetime').editable(false),
            nga.field('date_mod','datetime').editable(false),
        ])
        .onSubmitError(['error', 'form', 'progression', 'notification', function (error, form, progression, notification) {
            var error_message = '';
            if (error.data.message) {
                error_message = error.data.message;
            }
            if (error.data.details) {
                error.data.details.forEach(violation => {
                    if (form[violation.path]) {
                        form[violation.path].$valid = false;
                        error_message +=violation.message;
                    }
                });
            }

            progression.done();
            notification.log(error_message, {addnCls: 'humane-flatty-error'});
            return false;
        }]);
    actions.deletionView()
    //     .onSubmitError(['error', 'form', 'progression', 'notification', function (error, form, progression, notification) {
    //     var error_message = '';
    //     if (error.data.message) {
    //         error_message = error.data.message;
    //     }
    //     if (error.data.details) {
    //         error.data.details.forEach(violation => {
    //             if (form[violation.path]) {
    //                 form[violation.path].$valid = false;
    //                 error_message +=violation.message;
    //             }
    //         });
    //     }
    //
    //     progression.done();
    //     notification.log(error_message, {addnCls: 'humane-flatty-error'});
    //     return false;
    // }]);

    return actions;
}
