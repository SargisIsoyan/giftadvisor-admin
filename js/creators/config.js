import moment from 'moment';

var parseDate = v => {
    return (v)?moment(v.toString()).format("YYYY-MM-DD"):v;
}
export default function (nga, admin) {
    const statuses = ['active', 'inactive'];
    const genders = ['male', 'female', 'other'];
    const statusChoices = statuses.map(status => ({label: status, value: status}));
    const genderChoices = genders.map(gender => ({label: gender, value: gender}));
    const animatedChoices  = [{
        label:"Creator",
        value:2
    },{
        label:"Corporate",
        value:4
    },{
        label:"Celebrity",
        value:3
    }]
    var creators = admin.getEntity('creators');
    creators.listView()
        .title('Creators')
        .fields([
            nga.field('i', 'template')
                .label('')
                .template('<zoom-in-modal thumbnail="{{ entry.values.profile_picture }}" image="{{ entry.values.profile_picture }}"></zoom-in-modal>'),
            nga.field('name') // use last_name for sorting
                .label('Name')
                .isDetailLink(true)
                .template('{{ entry.values.name }}' ),
            nga.field('applicant_first_name', 'template')
                .label('Applicant Name')
                .template('{{ entry.values.applicant_first_name }} {{ entry.values.applicant_last_name }}'),
            nga.field('country')
                .label('Country')
                .template('{{ entry.values.country | isoCountry  }}'),
            nga.field('phone')
                .label('Phone'),
            nga.field('used_storage', 'template')
                .label('Storage')
                .template('{{ entry.values.used_storage | bytes }}'),
            nga.field('slug')
                .label('Slug')
                .template('<a href="http://app.sticker.market/#/creator/{{entry.values.slug}}" target="_blank">{{entry.values.slug}}</a>'),
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
                })
        ])
        .listActions([
            '<ma-filtered-list-button entity-name="products" filter="{ owner: entry.values._id }" size="xs" label="Creator Stickers"></ma-filtered-list-button>',
            '<activate-creator size="xs" review="entry" id="{{entry.values._id}}"></activate-creator>',
            'edit'
        ])
        .filters([
            nga.field('q', 'template')
                .label('')
                .pinned(true)
                .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>'),
            nga.field('status', 'choice')
                .label('Status')
                .choices(statusChoices),
            nga.field('type', 'choice')
                .label('Type')
                .choices(animatedChoices),
        ])
        .sortField('name')
        .sortDir('ASC');
    creators.editionView()
        .title('<img src="{{ entry.values.profile_picture }}" width="50" style="vertical-align: text-bottom"/> {{ entry.values.name }}\'s details')
        .fields([
            nga.field('name'),
            nga.field('slug')
                .editable(false),
            nga.field('status')
                .editable(false),
            nga.field('email','email'),
            nga.field('applicant_first_name'),
            nga.field('applicant_last_name'),
            nga.field('birth_date', 'date')
                .map(parseDate),
            nga.field('gender', 'choice')
                .choices(genderChoices),
            nga.field('website'),
            nga.field('address_1', 'text'),
            nga.field('address_2', 'text'),
            nga.field('zip_code'),
            nga.field('used_storage','template').template('{{ entry.values.used_storage | bytes }}')
                .editable(false),
            nga.field('phone'),
            nga.field('partnership','json')
                .template('<partnership entry="entry"></partnership>')
        ])
        .actions([
        '<activate-creator review="entry"></activate-creator>',
    ])

    return creators;
}
