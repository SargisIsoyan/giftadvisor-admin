export default function (nga, admin) {
    const statuses = ['active', 'inactive'];
    const statusChoices = statuses.map(status => ({label: status, value: status}));
    var tags = admin.getEntity('tags');
    tags.listView()
        .title('Tags')
        .fields([
            nga.field('name.en') // use last_name for sorting
                .isDetailLink(true),
            nga.field('slug'),
            nga.field('rate', 'number'),
            nga.field('date_mod').template("<span >{{entry.values.date_mod | amDateFormat:'YYYY.MM.DD HH:mm:ss'}}</span>")
        ])
        .listActions([
            '<ma-filtered-list-button entity-name="stickers" filter="{ tags: [entry.values._id] }" size="xs" label="Related Products"></ma-filtered-list-button>',
            'edit',
            'delete'
        ])
        .filters([
            nga.field('q', 'template')
                .label('')
                .pinned(true)
                .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>'),
        ])
        .batchActions(['delete', '<batch-approve type="active" remote="template_tags" selection="selection"></batch-approve>',])
        .sortField('name')
        .sortDir('ASC');
    tags.creationView()
        .fields([
            nga.field('name.en').validation({required: true}),
            nga.field('name.hy').validation({required: true}),
            nga.field('slug')
                .editable(false),
            nga.field('rate', 'number'),
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
    
    tags.editionView()
        .title('{{ entry.values.name.en }}\'s details')
        .fields([tags.creationView().fields(),
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
        }])

    return tags;
}
