/**
 * Created by sargis.isoyan on 16/05/2017.
 *
 * Edition field for a selection of elements in a list - a multiple select.
 *
 * @example <ma-choices-field entry="entry" field="field" value="value"></ma-choices-field>
 */
export default function maChoicesFieldTags($compile) {
    'use strict';

    return {
        scope: {
            'field': '&',
            'value': '=',
            'entry': '=?',
            'datastore': '&?',
            'refresh': '&'
        },
        restrict: 'E',
        compile: function () {
            return {
                pre: function (scope, element) {
                    console.log(scope.value);
                    var field = scope.field();
                    var attributes = field.attributes();
                    scope.placeholder = (attributes && attributes.placeholder) || 'FILTER_VALUES';
                    scope.name = field.name();
                    scope.v = field.validation();

                    var refreshAttributes = '';
                    var itemsFilter = '| filter: {label: $select.search}';
                    if (field.type().indexOf('reference') === 0 && field.remoteComplete()) {
                        scope.refreshDelay = field.remoteCompleteOptions().refreshDelay;
                        refreshAttributes = 'refresh-delay="refreshDelay" refresh="refresh({ $search: $select.search })"';
                        //itemsFilter = '';
                    }
                    var choices = scope.value ? scope.value.map(choice => ({label: choice, value: choice})) : [];
                    scope.newTagChoise = null;
                    scope.onRemove = function () {
                        scope.refresh({$search: this.$select.search})
                    };
                    scope.newTag = function (name) {
                        scope.newTagChoise = {
                            label: name,
                            value: name
                        };
                        return scope.newTagChoise;
                    };
                    var template = `
                        <ui-select  ${scope.v.required ? 'ui-select-required' : ''} multiple on-remove="onRemove()" tagging="newTag" ng-model="$parent.value" tagging-label="new" ng-required="v.required" id="{{ name }}" name="{{ name }}">
                            <ui-select-match placeholder="{{ placeholder | translate }}">{{ $item.label | translate }}</ui-select-match>
                            <ui-select-choices ${refreshAttributes} repeat="item.value as item in choices ${itemsFilter}">                            
                                {{ item.label | translate }}
                            </ui-select-choices>
                        </ui-select>`;

                    scope.choices = typeof(choices) === 'function' ? choices(scope.entry) : choices;
                    element.html(template);

                    var select = element.children()[0];

                    for (var name in attributes) {
                        select.setAttribute(name, attributes[name]);
                    }

                    $compile(element.contents())(scope);
                },
                post: function (scope) {
                    scope.$on('choices:update', function (e, data) {
                        scope.choices = data.choices;
                        scope.newTagChoise && scope.choices.push(scope.newTagChoise);
                        scope.$root.$$phase || scope.$digest();
                    });
                }
            };
        }
    };
}

maChoicesFieldTags.$inject = ['$compile'];
