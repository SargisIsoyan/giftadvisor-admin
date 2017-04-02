/**
 * Created by sargis on 11/19/16.
 */
import Entry from 'admin-config/lib/Entry';

export default function refField(ReferenceRefresher, Restangular) {
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
            if (!field.remoteComplete()) {
                // fetch choices from the datastore, populated during routing resolve
                let initialEntries = scope.datastore()
                    .getEntries(field.targetEntity().uniqueId + '_choices');
                if (scope.value) {
                    const isCurrentValueInInitialEntries = initialEntries.filter(e => e.identifierValue === scope.value).length > 0;
                    if (!isCurrentValueInInitialEntries) {
                        initialEntries.unshift(scope.datastore()
                            .getEntries(field.targetEntity().uniqueId + '_values')
                            .find(entry => entry.values[identifierName] == scope.value)
                        );
                    }
                }
                const initialChoices = initialEntries.map(entry => ({
                    value: entry.values[identifierName],
                    label: entry.values[field.targetField().name()]
                }));
                scope.$broadcast('choices:update', {choices: initialChoices});
            } else {
                // ui-select doesn't allow to prepopulate autocomplete selects, see https://github.com/angular-ui/ui-select/issues/1197
                // let ui-select fetch the options using the ReferenceRefresher
                scope.refresh = function refresh(search) {
                    if (search && search.length > 0) {
                        return ReferenceRefresher.refresh(field, scope.value, search)
                            .then(function addCurrentChoice(results) {
                                if (!search && scope.value) {
                                    const isCurrentValueInEntries = results.filter(e => e.value === scope.value).length > 0;
                                    if (!isCurrentValueInEntries) {
                                        const currentEntry = scope.datastore()
                                            .getEntries(field.targetEntity().uniqueId + '_values')
                                            .find(entry => entry.values[identifierName] == scope.value);
                                        results.unshift({
                                            value: currentEntry.values[identifierName],
                                            label: currentEntry.values[field.targetField().name()]
                                        });
                                    }
                                }
                                return results;
                            })
                            .then(formattedResults => {
                                scope.$broadcast('choices:update', {choices: formattedResults});
                            });
                    } else {
                        const currentEntry = scope.datastore()
                            .getEntries(field.targetEntity().uniqueId + '_values')
                            .find(entry => entry.values[identifierName] == scope.value);
                        var results = [];
                        if (!currentEntry) {
                            if (scope.value) {
                                Restangular
                                    .one(field.targetEntity().name(), scope.value)
                                    .get()
                                    .then((response) => {
                                        if (response.data._id) {
                                            scope.datastore().addEntry(field.targetEntity().uniqueId + '_values', new Entry(field.targetEntity().name(), response.data, scope.value));
                                            results = [{
                                                value: scope.value,
                                                label: response.data.name
                                            }];
                                        }
                                        scope.$broadcast('choices:update', {choices: results});
                                    })
                                    .catch(function (err) {
                                        console.log(err);
                                    });
                            }
                        } else {
                            results = [{
                                value: currentEntry.values[identifierName],
                                label: currentEntry.values[field.targetField().name()]
                            }];
                            scope.$broadcast('choices:update', {choices: results});
                        }
                    }
                };
                scope.$watch("foo", function (i) {
                    scope.refresh();
                });
            }
        },
        template: `<ma-choice-field
                field="field()"
                datastore="datastore()"
                refresh="refresh($search)"
                value="value">
            </ma-choice-field>`
    };
}

refField.$inject = ['ReferenceRefresher', 'Restangular'];
