import templateEdition from "./templateEdition.html";
import templateCreation from "./templateCreation.html";
export default function (nga, admin) {
    const statuses = ['pending', 'approved', 'rejected'];
    const types = ['standard', 'multiply', 'hardLight', 'screen'
        , 'overlay'
        , 'darken'
        , 'lighten'
        , 'colorDodge'
        , 'colorBurn'
        , 'softLight'
        , 'difference'
        , 'exclusion'
        , 'hue'
        , 'saturation'
        , 'color'
        , 'luminosity'
        , 'clear'
        , 'copy'
        , 'sourceIn'
        , 'sourceOut'
        , 'sourceAtop'
        , 'destinationOver'
        , 'destinationIn'
        , 'destinationOut'
        , 'destinationAtop'
        , 'xor'
        , 'plusDarker'
        , 'plusLighter']
    const statusChoices = statuses.map(status => ({label: status, value: status}));
    const typeChoices = types.map(type => ({label: type, value: type}));

    var templates = admin.getEntity('templates')
            .label('Templates')
        ;
    templates.listView()
        .title('All Templates')
        .fields([
            nga.field('i', 'template')
                .label('')
                .template('<zoom-in-modal thumbnail="{{ entry.values.main_image }}" image="{{ entry.values.main_image }}"></zoom-in-modal>'),
            nga.field('name').isDetailLink(true),
            nga.field('owner', 'reference')
                .label('Owner')
                .targetEntity(admin.getEntity('creators'))
                .targetField(nga.field('name'))
                .cssClasses('hidden-xs'),
            nga.field('price', 'amount')
                .cssClasses('hidden-xs'),
            nga.field('size', 'float')
                .template('{{ entry.values.size|bytes }} ')
                .cssClasses('hidden-xs'),
            nga.field('status', 'choice')
                .choices(statusChoices)
                .cssClasses(function (entry) { // add custom CSS classes to inputs and columns
                    if (!entry) return;
                    if (entry.values.status == 'approved') {
                        return 'text-center bg-success';
                    }
                    if (entry.values.status == 'rejected') {
                        return 'text-center bg-danger';
                    }
                    return 'text-center bg-warning';
                }),
            nga.field('date_mod').template("<span >{{entry.values.date_mod | amDateFormat:'YYYY.MM.DD HH:mm:ss'}}</span>")
        ])
        .batchActions([
            'delete'
        ])
        .filters([
            nga.field('query', 'template')
                .label('')
                .pinned(true)
                .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"/><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>'),
            nga.field('status', 'choice')
                .label('Status')
                .choices(statusChoices),
            nga.field('type', 'choice')
                .label('Blend')
                .choices(typeChoices),
            nga.field('owner', 'reference')
                .label('Owner')
                .targetEntity(admin.getEntity('creators'))
                .targetField(nga.field('name'))
                .remoteComplete(true, {
                    searchQuery: function (search) {
                        return {q: search};
                    }
                }),
        ])
        .listActions([
            'edit',
            'delete',
            '<approve-sticker size="xs" type="template" review="entry" id="{{entry.values._id}}"></approve-sticker>',
        ]);
    templates.creationView()
        .template(templateCreation)
        .fields([
            nga.field('name')
                .validation({required: true}),
            nga.field('description', 'text'),
            nga.field('owner', 'reference')
                .label('Owner')
                .targetEntity(admin.getEntity('creators'))
                .targetField(nga.field('name'))
                .remoteComplete(true, {
                    searchQuery: function (search) {
                        return {q: search};
                    }
                }).validation({required: true}),
            nga.field('tags', 'reference_many')
                .label('Tags')
                .targetEntity(admin.getEntity('template_tags'))
                .targetField(nga.field('name'))
                .remoteComplete(true, {
                    searchQuery: function (search) {
                        return {q: search};
                    }
                }),
            nga.field('price', 'float'),
            nga.field('pg', 'number'),
            nga.field('main_image', 'file'),
            nga.field('images_zip', 'file'),
            nga.field('banner', 'file'),
            nga.field('copyright'),
            nga.field('certificate', 'file'),
            nga.field('type', 'choice')
                .label('Blend')
                .choices(typeChoices),
        ]);

    templates.editionView()
        .title('Edit sticker "{{entry.values.name}}"')
        .template(templateEdition)
        .fields([
            nga.field('name')
                .validation({required: true}),
            nga.field('description', 'text'),
            nga.field('owner', 'reference')
                .label('Owner')
                .targetEntity(admin.getEntity('creators'))
                .targetField(nga.field('name'))
                .remoteComplete(true, {
                    searchQuery: function (search) {
                        return {q: search};
                    }
                }).validation({required: true}),
            nga.field('tags', 'reference_many')
                .label('Tags')
                .targetEntity(admin.getEntity('template_tags'))
                .targetField(nga.field('name'))
                .remoteComplete(true, {
                    searchQuery: function (search) {
                        return {q: search};
                    }
                }),
            nga.field('price', 'number'),
            nga.field('pg', 'number'),
            nga.field('main_image', 'file'),
            nga.field('images_zip', 'file'),
            nga.field('banner', 'file'),
            nga.field('copyright'),
            nga.field('certificate', 'file'),
            nga.field('status', 'choice')
                .choices(statusChoices),
            nga.field('type', 'choice')
                .label('Blend')
                .choices(typeChoices),
            nga.field('slug'),
            nga.field('positions', 'json')
        ]).onSubmitError(['error', 'form', 'progression', 'notification', function (error, form, progression, notification) {
        if (error.details) {
            error.details.forEach(violation => {
                if (form[violation.path]) {
                    form[violation.path].$valid = false;
                }
            });
        }
        var error_message = '';
        if (error.data.message) {
            error_message = error.data.message;
        }
        // stop the progress bar
        progression.done();
        // add a notification
        notification.log(`Some values are invalid. ` + error_message, {addnCls: 'humane-flatty-error'});
        // cancel the default action (default error messages)
        return false;
    }]).actions([
        '<approve-sticker review="entry"></approve-sticker>',
        'list',
        'delete'
    ]);


    return templates;
}
