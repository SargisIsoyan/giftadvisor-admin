/**
 * Created by sargis on 11/21/16.
 */
import Entry from 'admin-config/lib/Entry';
export default function maReferenceManyField(ReferenceRefresher, Restangular) {
    return {
        scope: {
            'field': '&',
            'value': '=',
            'entry': '=?',
            'datastore': '&?',
            'foo': '='
        },
        restrict: 'E',
        link: function (scope) {
            const field = scope.field();
            const identifierName = field.targetEntity().identifier().name();
            scope.name = field.name();
            scope.v = field.validation();
            scope.choices = [];
            var promises = [];
            const setInitialChoices = (initialEntries) => {
                if (scope.value && scope.value.length) {
                    scope.value.map((value) => {
                        const isCurrentValueInInitialEntries = initialEntries.filter(e => e.identifierValue === value).length > 0;
                        var idReg = new RegExp(/^[a-f\d]{24}$/i);
                        if (value && !isCurrentValueInInitialEntries && idReg.test(value)) {
                            var entry = scope.datastore()
                                .getEntries(field.targetEntity().uniqueId + '_values')
                                .filter(entry => entry.values[identifierName] == value)
                                .pop();
                            if (!entry) {
                                promises.push(Restangular
                                    .one(field.targetEntity().name(), value)
                                    .get()
                                    .then((response) => {
                                        if (response.data._id) {
                                            entry = new Entry(field.targetEntity().name(), response.data, value);
                                            scope.datastore().addEntry(field.targetEntity().uniqueId + '_values', entry);
                                            initialEntries.push(entry);
                                        }
                                    }));
                            } else {
                                initialEntries.push(entry);
                            }
                        }
                    });
                }
                Promise.all(promises).then(()=> {
                    const initialChoices = initialEntries.map(entry => ({
                        value: entry.values[identifierName],
                        label: entry.values[field.targetField().name()]
                    }));
                    scope.$broadcast('choices:update', {choices: initialChoices});
                });
            };


            if (!field.remoteComplete()) {
                // fetch choices from the datastore
                const initialEntries = scope.datastore()
                    .getEntries(field.targetEntity().uniqueId + '_choices');
                setInitialChoices(initialEntries);
            } else {
                const initialEntries = [];
                setInitialChoices(initialEntries);

                // ui-select doesn't allow to prepopulate autocomplete selects, see https://github.com/angular-ui/ui-select/issues/1197
                // let ui-select fetch the options using the ReferenceRefresher
                scope.refresh = (search) => {
                    if (search && search.length > 0) {
                        return ReferenceRefresher.refresh(field, scope.value, search)
                            .then(formattedResults => {
                                scope.$broadcast('choices:update', {choices: formattedResults});
                            });
                    }
                };
                scope.$watch("foo", function (i) {
                    setInitialChoices(initialEntries);
                });
            }
        },
        template: `<ma-choices-field-tags
                field="field()"
                datastore="datastore()"
                refresh="refresh($search)"
                value="value">
            </ma-choices-field-tags>`
    };
}

maReferenceManyField.$inject = ['ReferenceRefresher', 'Restangular'];
