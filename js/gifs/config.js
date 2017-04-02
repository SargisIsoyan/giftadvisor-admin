import moment from 'moment';
import gifsEditionTemplate from './templates/gifsEditionTemplate.html';
import gifsCreateTemplate from './templates/gifsCreateTemplate.html';
import gifsImageTemplate from './templates/gifsImageTemplate.html';
import Entry from 'admin-config/lib/Entry';
var fromNow = v => moment(v).fromNow();

export default function (nga, admin) {
    const statuses = ['pending', 'moderated'] ;
    const statusChoices = statuses.map(status => ({label: status, value: status}));
    const animatedChoices = [{
        label: "Yes",
        value: 1
    }, {
        label: "No",
        value: 0
    }]
    var gifs = admin.getEntity('gifs')
        .label('Gifs');
    gifs.listView()
        .title('All Gifs')
        .fields([
            nga.field('i', 'template')
                .label('')
                .template('<zoom-in-modal thumbnail="{{ entry.values\[\'first_frame_small.image\'\] }}" image="{{ entry.values\[\'webp.image\'\] }}"></zoom-in-modal>'),
            nga.field('slug')
                .map((value, entry)=> {
                    if (value.length > 23) {
                        return value.substring(0, 20) + '...';
                    } else {
                        return value;
                    }
                })
                .isDetailLink(true),
            nga.field('owner', 'reference')
                .label('Owner')
                .targetEntity(admin.getEntity('users'))
                .targetField(nga.field('name'))
                .singleApiCall(ids => {
                    debugger;
                    return {id:ids._id};
                })
                .cssClasses('hidden-xs'),
            nga.field('size', 'float')
                .template('{{ entry.values.size|bytes }} ')
                .cssClasses('hidden-xs'),
            nga.field('status', 'choice')
                .choices(statusChoices)
                .cssClasses(function (entry) { // add custom CSS classes to inputs and columns
                    if (!entry) return;
                    if (entry.values.status == 'moderated') {
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
            nga.field('q', 'template')
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
                .targetEntity(admin.getEntity('users'))
                .targetField(nga.field('name'))
                .remoteComplete(true, {
                    searchQuery: function (search) {
                        return {q: search, all: true};
                    }
                }),
        ])
        .listActions([
            'edit',
            'delete',
            '<gif-moderate size="xs" gif="entry" id="{{entry.values._id}}"></gif-moderate>' ,
        ]);
    gifs.creationView()
        .template(gifsCreateTemplate)
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
    gifs.editionView()
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
                        .template(gifsImageTemplate),
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
            var promises = []
            entry.values.images.map(image => {
                refFields.map(field=> {
                    let fieldsArr = (typeof image[field.name()] == 'object') ? image[field.name()] : [image[field.name()]];
                    fieldsArr.map(value=> {
                        promises.push(Restangular
                            .one(field.targetEntity().name(), value)
                            .get()
                            .then((response) => {
                                datastore.addEntry(field.targetEntity().uniqueId + '_values', new Entry(field.targetEntity().name(), response.data, value));
                            }));
                    })
                });

            });
            return Promise.all(promises);
        }])
        .template(gifsEditionTemplate)
        .actions([
            '<approve-sticker review="entry"></approve-sticker>',
            'list',
            'delete'
        ]);

    return gifs;
}
