import moment from 'moment';
import productsEditionTemplate from './productsEditionTemplate.html';
import productsCreateTemplate from './productsCreateTemplate.html';
import productsImageTemplate from './productImageTemplate.html';
import Entry from 'admin-config/lib/Entry';
var fromNow = v => moment(v).fromNow();

export default function (nga, admin) {
    const statuses = ['pending', 'approved', 'rejected'];
    const statusChoices = statuses.map(status => ({label: status, value: status}));
    var products = admin.getEntity('products')
        .label('Products');
    products.listView()
        .title('All products')
        .fields([
            nga.field('i', 'template')
                .label('')
                .template('<zoom-in-modal thumbnail="{{ entry.values[\'main_image.src\'] }}" image="{{ entry.values[\'main_image.original_src\'] }}"></zoom-in-modal>'),
            nga.field('name').isDetailLink(true),
            nga.field('price', 'amount')
                .cssClasses('hidden-xs'),
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
        ])
        .listActions([
            'edit',
            'delete'
        ]);
    products.creationView()
        .template(productsCreateTemplate)
        .fields([
            nga.field('name.en')
                .validation({required: true}),
            nga.field('name.hy')
                .validation({required: true}),
            nga.field('description.en', 'text'),
            nga.field('description.hy', 'text'),
            nga.field('category', 'reference')
                .label('Category')
                .targetEntity(admin.getEntity('categories'))
                .targetField(nga.field('name'))
                .remoteComplete(true, {
                    searchQuery: function (search) {
                        return {q: search};
                    }
                }).validation({required: true}),
            nga.field('tags', 'reference_many')
                .label('Tags')
                .targetEntity(admin.getEntity('tags'))
                .targetField(nga.field('name.en'))
                .validation({required: true})
                .remoteComplete(true, {
                    searchQuery: function (search) {
                        return {q: search};
                    }
                })
                .validation({required: true}),
            nga.field('price', 'float')
                .validation({required: true}),
            nga.field('old_price', 'float'),
            nga.field('main_image', 'file')
                .validation({required: true}),
            nga.field('images_zip', 'file')
                .validation({required: true}),
            nga.field('additional_fields', 'embedded_list')
                .label('Additional Fields')
                .targetFields([
                    nga.field('type', 'choice')
                        .label('Type')
                        .choices([{label: 'Info field', value: 'info'},{label: 'Selectable', value: 'selectable'}])
                        .validation({required: true}),
                    nga.field('name.en').label('Name En').validation({required: true}),
                    nga.field('value.en', 'choices').label('Value En')
                        .template('<ma-choices-field-new entry="entry" field="field" value="value"></ma-choices-field-new>')
                        .validation({required: true}),
                    nga.field('name.hy').label('Name Hy').validation({required: true}),
                    nga.field('value.hy','choices').label('Value Hy')
                        .template('<ma-choices-field-new entry="entry" field="field"  value="value"></ma-choices-field-new>')
                        .validation({required: true}),
                ])
        ]);
    products.editionView()
        .title('Edit product "{{entry.values.name}}"')
        .fields([
            nga.field('name.en')
                .validation({required: true}),
            nga.field('name.hy')
                .validation({required: true}),
            nga.field('description.en', 'text'),
            nga.field('description.hy', 'text'),
            nga.field('category', 'reference')
                .label('Category')
                .targetEntity(admin.getEntity('categories'))
                .targetField(nga.field('name'))
                .remoteComplete(true, {
                    searchQuery: function (search) {
                        return {q: search};
                    }
                }).validation({required: true}),
            nga.field('tags', 'reference_many')
                .label('Tags')
                .targetEntity(admin.getEntity('tags'))
                .targetField(nga.field('name.en'))
                .validation({required: true})
                .remoteComplete(true, {
                    searchQuery: function (search) {
                        return {q: search};
                    }
                })
                .validation({required: true}),
            nga.field('price', 'float')
                .validation({required: true}),
            nga.field('old_price', 'float')
                .validation({required: true}),
            nga.field('main_image', 'file')
                .validation({required: true}),
            nga.field('images', 'embedded_list')
                .label('Images')
                .targetFields([
                    nga.field('src', 'file')
                        .label('')
                        .cssClasses('sticker-image')
                        .template(productsImageTemplate),
                    nga.field('color')
                        .label('Color')
                ]),
            nga.field('additional_fields', 'embedded_list')
                .label('Additional Fields')
                .targetFields([
                    nga.field('type', 'choice')
                        .label('Type')
                        .choices([{label: 'Info field', value: 'info'},{label: 'Selectable', value: 'selectable'}])
                        .validation({required: true}),
                    nga.field('name.en').label('Name En').validation({required: true}),
                    nga.field('value.en', 'choices').label('Value En')
                        .template('<ma-choices-field-new entry="entry" field="field" value="value"></ma-choices-field-new>')
                        .validation({required: true}),
                    nga.field('name.hy').label('Name Hy').validation({required: true}),
                    nga.field('value.hy','choices').label('Value Hy')
                        .template('<ma-choices-field-new entry="entry" field="field"  value="value"></ma-choices-field-new>')
                        .validation({required: true}),
                ])
        ])
        .prepare(['Restangular', 'datastore', 'view', 'entry', function (Restangular, datastore, view, entry) {
            var refFields = view.getField('images').targetFields().filter(field => {
                return field.type() == 'reference' || field.type() == 'reference_many'
            });
            var promises = [];
            entry.values.images.map(image => {
                refFields.map(field => {
                    if (typeof image[field.name()] == 'object' && image[field.name()] && image[field.name()]._id) {
                        datastore.addEntry(field.targetEntity().uniqueId + '_values', new Entry(field.targetEntity().name(), image[field.name()], image[field.name()]._id));
                        image[field.name()] = image[field.name()]._id;
                    } else if (angular.isArray(image[field.name()])) {
                        var tags = [];
                        image[field.name()].map(tag => {
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
        .template(productsEditionTemplate)
        .actions([
            '<approve-product review="entry"></approve-product>',
            'list',
            'delete'
        ]);
    return products;
}
