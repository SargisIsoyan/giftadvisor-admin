import moment from 'moment';

var parseDate = v => {
    return (v)?moment(v.toString()).format("YYYY-MM-DD"):v;
}

export default function (nga, admin) {
    const statuses = ['active', 'inactive'];
    const genders = ['male', 'female', 'other'];
    const userRole = ['admin','user'];
    const statusChoices = statuses.map(status => ({label: status, value: status}));
    const genderChoices = genders.map(gender => ({label: gender, value: gender}));
    const userRoleChoices = userRole.map(role => ({label: role, value: role}));

    var users = admin.getEntity('users');
    users.listView()
        .title('Simple Users')
        .fields([
            nga.field('i', 'template')
                .label('')
                .template('<zoom-in-modal thumbnail="{{ entry.values.profile_picture }}" image="{{ entry.values.profile_picture }}"></zoom-in-modal>'),
            nga.field('first_name')
                .label('Name')
                .template('{{ entry.values.first_name }} {{entry.values.last_name}}')
                .isDetailLink(true),
            nga.field('slug')
                .label('Slug')
                .isDetailLink(true),
            nga.field('role')
                .label('Role')
        ])
        .listActions([
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
                .choices(userRoleChoices),
        ])
        .sortField('name')
        .sortDir('ASC');
    users.editionView()
        .title('<img src="{{ entry.values.profile_picture }}" width="50" style="vertical-align: text-bottom"/> {{ entry.values.first_name }} {{entry.values.last_name}}\'s details')
        .fields([
            nga.field('name'),
            nga.field('slug')
                .editable(false),
            nga.field('email', 'email'),
            nga.field('status')
                .editable(false),
            nga.field('birth_date', 'date')
                .map(parseDate),
            nga.field('gender', 'choice')
                .choices(genderChoices)
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
            notification.log(error_message, {addnCls: 'humane-flatty-error'});
            return false;
        }])
        .actions([
            '<activate-creator review="entry"></activate-creator>',
        ]);

    return users;
}
