import moment from 'moment';
import stickersEditionTemplate from './stickersEditionTemplate.html';
import stickersCreateTemplate from './stickersCreateTemplate.html';
import stickersImageTemplate from './stickerImageTemplate.html';
import Entry from 'admin-config/lib/Entry';
var fromNow = v => moment(v).fromNow();

export default function (nga, admin) {
    const statuses = ['pending', 'approved', 'rejected'];
    const statusChoices = statuses.map(status => ({label: status, value: status}));
    const animatedChoices = [{
        label: "Yes",
        value: 1
    }, {
        label: "No",
        value: 0
    }]
    var stickers = admin.getEntity('stickers')
        .label('Stickers');
    stickers.listView()
        .title('All Stickers')
        .fields([
            nga.field('i', 'template')
                .label('')
                .template('<zoom-in-modal thumbnail="{{ entry.values.main_image }}" image="{{ entry.values.main_image }}"></zoom-in-modal>'),
            nga.field('name').isDetailLink(true),
            nga.field('owner', 'reference')
                .label('Owner')
                .targetEntity(admin.getEntity('creators'))
                .targetField(nga.field('name'))
                .singleApiCall(ids => ({'id': ids}))
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
            nga.field('animated', 'choice')
                .label('Animated')
                .choices(animatedChoices),
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
            '<approve-sticker size="xs" type="sticker" review="entry" id="{{entry.values._id}}"></approve-sticker>',
        ]);
    stickers.creationView()
        .template(stickersCreateTemplate)
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
                .targetEntity(admin.getEntity('tags'))
                .targetField(nga.field('name'))
                .validation({required: true})
                .remoteComplete(true, {
                    searchQuery: function (search) {
                        return {q: search};
                    }
                })
                .validation({required: true}),
            nga.field('price', 'float')
                .validation({required: true}),
            nga.field('pg', 'number')
                .validation({required: true}),
            nga.field('main_image', 'file')
                .validation({required: true}),
            nga.field('images_zip', 'file')
                .validation({required: true}),
            nga.field('copyright'),
            nga.field('certificate', 'file')
        ]);
    stickers.editionView()
        .title('Edit sticker "{{entry.values.name}}"')
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
                })
                .validation({required: true}),
            nga.field('tags', 'reference_many')
                .label('Tags')
                .targetEntity(admin.getEntity('tags'))
                .targetField(nga.field('name'))
                .validation({required: true})
                .remoteComplete(true, {
                    searchQuery: function (search) {
                        return {q: search};
                    }
                })
                .validation({required: true}),
            nga.field('price', 'float')
                .validation({required: true}),
            nga.field('pg', 'number')
                .validation({required: true}),
            nga.field('main_iamge', 'template')
                .template('<file-field field="main_image" thumbnail="{{ entry.values.main_image }}" multiple="false" type="image"></file-field>'),
            nga.field('copyright'),
            nga.field('certificate', 'file'),
            nga.field('animated', 'choice')
                .choices([
                    {value: 0, label: "No"},
                    {value: 1, label: "Yes"}
                ]).validation({required: true}),
            nga.field('installs', 'number')
                .editable(false),
            nga.field('size', 'float')
                .template('{{ entry.values.size|bytes }} '),
            nga.field('visibility', 'choice')
                .choices([
                    {value: 'public', label: "Public"},
                    {value: 'private', label: "Private"}
                ]),
            nga.field('status', 'choice')
                .choices(statusChoices),
            nga.field('slug'),
            nga.field('images', 'embedded_list')
                .label('Images')
                .targetFields([
                    nga.field('src', 'file')
                        .label('')
                        .cssClasses('sticker-image')
                        .template(stickersImageTemplate),
                    nga.field('action', 'reference')
                        .label('Action')
                        .targetEntity(admin.getEntity('actions'))
                        .targetField(nga.field('name'))
                        .remoteComplete(true, {
                            searchQuery: function (search) {
                                return {q: search};
                            }
                        })
                        .validation({required: true}),
                    nga.field('emotion', 'reference')
                        .label('Emotion')
                        .targetEntity(admin.getEntity('emotions'))
                        .targetField(nga.field('name'))
                        .remoteComplete(true, {
                            searchQuery: function (search) {
                                return {q: search};
                            }
                        })
                        .validation({required: true}),
                    nga.field('tags', 'reference_many')
                        .label('Tags')
                        .targetEntity(admin.getEntity('tags'))
                        .targetField(nga.field('name'))
                        .validation({required: true})
                        .remoteComplete(true, {
                            searchQuery: function (search) {
                                return {q: search};
                            }
                        })
                ]),
            nga.field('date_at', 'datetime'),
            nga.field('date_mod', 'datetime'),
        ])
        .prepare(['Restangular', 'datastore', 'view', 'entry', function (Restangular, datastore, view, entry) {
            var refFields = view.getField('images').targetFields().filter(field=> {
                return field.type() == 'reference' || field.type() == 'reference_many'
            });
            var promises = [];
            entry.values.images.map(image => {
                refFields.map(field=> {
                    if (typeof image[field.name()] == 'object' && image[field.name()] && image[field.name()]._id) {
                        datastore.addEntry(field.targetEntity().uniqueId + '_values', new Entry(field.targetEntity().name(), image[field.name()], image[field.name()]._id));
                        image[field.name()] = image[field.name()]._id;
                    } else if (angular.isArray(image[field.name()])) {
                        var tags = [];
                        image[field.name()].map(tag=> {
                            if (tag._id) {
                                datastore.addEntry(field.targetEntity().uniqueId + '_values', new Entry(field.targetEntity().name(), tag, tag._id));
                                tags.push(tag._id);
                            }
                        });
                        image[field.name()] = tags;
                    }
                    else if (typeof image[field.name()] == 'string') {
                        promises.push(Restangular
                            .one(field.targetEntity().name(), image[field.name()])
                            .get()
                            .then((response) => {
                                datastore.addEntry(field.targetEntity().uniqueId + '_values', new Entry(field.targetEntity().name(), response.data, image[field.name()]));
                            }));
                    }
                });

            });
            Promise.all(promises).then(function () {

            }).catch(function (err) {
                console.log(err);
            });
        }])
        .template(stickersEditionTemplate)
        .actions([
            '<approve-sticker review="entry"></approve-sticker>',
            'list',
            'delete'
        ]);
    stickers.deletionView()
    // .onSubmitError(['error', 'form', 'progression', 'notification', function (error, form, progression, notification) {
    //     progression.done();
    //     var error_message = 'Something went wrong.';
    //     if (error.data.message) {
    //         error_message = error.data.message;
    //     }
    //     if(error.data.error_info){
    //         error_message += error.data.error_info;
    //     }
    //     progression.done();
    //     notification.log( error_message, {addnCls: 'humane-flatty-error'});
    //     return false;
    // }]);

    return stickers;
}
