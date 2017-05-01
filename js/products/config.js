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
                .template('<zoom-in-modal thumbnail="{{ entry.values.main_image }}" image="{{ entry.values.main_image }}"></zoom-in-modal>'),
            nga.field('name').isDetailLink(true),
            nga.field('price', 'amount')
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
        ])
        .listActions([
            'edit',
            'delete',
            '<approve-product size="xs" type="product" review="entry" id="{{entry.values._id}}"></approve-product>',
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
            nga.field('old_price', 'float')
                .validation({required: true}),
            nga.field('main_image', 'file')
                .validation({required: true}),
            nga.field('images_zip', 'file')
                .validation({required: true})
        ]);
    products.editionView()
        .title('Edit product "{{entry.values.name}}"')
        .fields([
            nga.field('name')
                .validation({required: true}),
            nga.field('description', 'text'),
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
            nga.field('main_iamge', 'template')
                .template('<file-field field="main_image" thumbnail="{{ entry.values.main_image }}" multiple="false" type="image"></file-field>'),
            nga.field('status', 'choice')
                .choices(statusChoices),
            nga.field('slug'),
            nga.field('images', 'embedded_list')
                .label('Images')
                .targetFields([
                    nga.field('src', 'file')
                        .label('')
                        .cssClasses('product-image')
                        .template(productsImageTemplate),
                ]),
            nga.field('date_at', 'datetime'),
            nga.field('date_mod', 'datetime'),
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
    products.deletionView()
    return products;
}
