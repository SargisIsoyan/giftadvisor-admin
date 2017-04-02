/**
 * Created by sargis on 11/24/16.
 */

export default function (nga, admin) {
    var categories = admin.getEntity('gif-categories');
    categories.listView()
        .title('Gif Categories')
        .fields([
            nga.field('name')
                .isDetailLink(true),
            nga.field('slug'),
            nga.field('count', 'number')
        ])
        .listActions([
            'edit',
            'delete'
        ])
        .filters([
            nga.field('q', 'template')
                .label('')
                .pinned(true)
                .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"/><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>'),
        ])
        .sortField('name')
        .sortDir('ASC');

    categories.creationView()
        .fields([
            nga.field('name').validation({required: true}),
            nga.field('slug')
                .editable(false),
            nga.field('gif', 'reference')
                .targetEntity(admin.getEntity('gifs'))
                .targetField(nga.field('name'))
                .template('<tag-gif entry="entry" field="::field" value="value" datastore="::datastore" for="categories"></tag-gif>'),
            nga.field('count', 'number'),
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
                        error_message += violation.message;
                    }
                });
            }

            progression.done();
            notification.log(`Some values are invalid. ` + error_message, {addnCls: 'humane-flatty-error'});
            return false;
        }]);

    categories.editionView()
        .title('{{ entry.values.name }}\'s details')
        .fields([categories.creationView().fields()])
        .onSubmitError(['error', 'form', 'progression', 'notification', function (error, form, progression, notification) {
            var error_message = '';
            if (error.data.message) {
                error_message = error.data.message;
            }
            if (error.data.details) {
                error.data.details.forEach(violation => {
                    if (form[violation.path]) {
                        form[violation.path].$valid = false;
                        error_message += violation.message;
                    }
                });
            }

            progression.done();
            notification.log(error_message, {addnCls: 'humane-flatty-error'});
            return false;
        }])

    return categories;
}
