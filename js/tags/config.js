export default function (nga, admin) {
    const statuses = ['active', 'inactive'];
    const statusChoices = statuses.map(status => ({label: status, value: status}));
    var tags = admin.getEntity('tags');
    tags.listView()
        .title('Tags')
        .fields([
            nga.field('name') // use last_name for sorting
                .isDetailLink(true),
            nga.field('slug'),
            nga.field('rate', 'number'),
            nga.field('status', 'choice')
                .choices(statusChoices)
                .cssClasses(function (entry) { // add custom CSS classes to inputs and columns
                    if (!entry) return;
                    if (entry.values.status == 'active') {
                        return 'text-center bg-success';
                    }
                    if (entry.values.status == 'inactive') {
                        return 'text-center bg-danger';
                    }
                    return 'text-center bg-warning';
                }),
            nga.field('date_mod').template("<span >{{entry.values.date_mod | amDateFormat:'YYYY.MM.DD HH:mm:ss'}}</span>")
        ])
        .listActions([
            '<ma-filtered-list-button entity-name="stickers" filter="{ tags: [entry.values._id] }" size="xs" label="Related Stickers"></ma-filtered-list-button>',
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
        .batchActions(['delete', '<batch-approve type="active" remote="template_tags" selection="selection"></batch-approve>',])
        .sortField('name')
        .sortDir('ASC');
    tags.creationView()

        .fields([
            nga.field('name').validation({required: true}),
            nga.field('slug')
                .editable(false),
            nga.field('description', 'text'),
            nga.field('rate', 'number'),
            nga.field('status', 'choice')
                .choices(statusChoices).validation({
                validator: function (value) {
                    if (value == null) throw new Error('Invalid Status');
                }
            }),


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
        .title('{{ entry.values.name }}\'s details')
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
