/**
 * Created by sargis on 11/14/16.
 */

import Entry from 'admin-config/lib/Entry';

export default function maEmbeddedListField() {
    return {
        scope: {
            'field': '&',
            'value': '=',
            'datastore': '&'
        },
        restrict: 'E',
        link: {
            pre: function (scope) {
                scope.i = 0;
                
                const field = scope.field();
                const targetEntity = field.targetEntity();
                const targetEntityName = targetEntity.name();
                const targetFields = field.targetFields();
                const sortField = field.sortField();
                const sortDir = field.sortDir() === 'DESC' ? -1 : 1;
                var filterFunc;
                if (field.permanentFilters()) {
                    const filters = field.permanentFilters();
                    const filterKeys = Object.keys(filters);
                    filterFunc = (entry) => {
                        return filterKeys.reduce((isFiltered, key) => isFiltered && entry.values[key] === filters[key], true);
                    };
                } else {
                    filterFunc = () => true;
                }
                scope.fields = targetFields;
                scope.targetEntity = targetEntity;
                scope.entries = Entry
                    .createArrayFromRest(scope.value || [], targetFields, targetEntityName, targetEntity.identifier().name())
                    .sort((entry1, entry2) => {
                        // use < and > instead of substraction to sort strings properly
                        if (entry1.values[sortField] > entry2.values[sortField]) {
                            return sortDir;
                        }
                        if (entry1.values[sortField] < entry2.values[sortField]) {
                            return -1 * sortDir;
                        }
                        return 0;
                    })
                    .filter(filterFunc);
                scope.addNew = () => scope.entries.push(Entry.createForFields(targetFields));
                scope.removeImage = entry => {
                   scope.entries = scope.entries.filter(e => e !==  entry);
                };
                scope.$watch('entries', (newEntries, oldEntries) => {
                    if (newEntries === oldEntries) {
                        return ;
                    }
                    scope.i++;
                    scope.value = newEntries.map(e => e.transformToRest(targetFields));
                }, true);
            }

        },
        template: `
<div class="row"><div class="col-sm-12">
    <ng-form ng-repeat="entry in entries track by $index" class="subentry" name="subform_{{$index}}" ng-init="formName = 'subform_' + $index">
        <div class="remove_button_container">
            <a class="btn btn-default btn-sm" ng-click="removeImage(entry)"><span class="glyphicon glyphicon-minus-sign" aria-hidden="true"></span>&nbsp;<span translate="REMOVE"></span></a>
        </div>
            <div class="form-field form-group" ng-init="field = fields[0]">
                <ma-field field="::field" value="entry.values.src" entry="entry" entity="::targetEntity" form="formName"  datastore="::datastore()"></ma-field>
            </div>
            <div class="form-field form-group" ng-init="field = fields[1]">
                <label for="actions" class="col-sm-2 control-label">Actions&nbsp;*&nbsp;</label>
                <div class="col-sm-10 col-md-8 col-lg-7">
                    <ref-field field="::field" value="entry.values.action" datastore="datastore()" foo="i"></ref-field>
                </div>
            </div>
            <div class="form-field form-group" ng-init="field = fields[2]">
                <label for="emotions" class="col-sm-2 control-label">Emotions&nbsp;*&nbsp;</label>
                <div class="col-sm-10 col-md-8 col-lg-7">
                    <ref-field field="::field" value="entry.values.emotion" datastore="datastore()" foo="i"></ref-field>
                </div>
            </div>
            <div class="form-field form-group" ng-init="field = fields[3]">
                <label for="actions" class="col-sm-2 control-label">Tags</label>
                <div class="col-sm-10 col-md-8 col-lg-7">
                    <ref-many-field field="::field" value="entry.values.tags" datastore="datastore()" foo="i"></ref-many-field>
                </div>
            </div>
        <hr/>
    </ng-form>
    <div class="form-group">
        <div class="col-sm-offset-2 col-sm-10">
            <a class="btn btn-default btn-sm" ng-click="addNew()"><span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>&nbsp;<span translate="ADD_NEW" translate-values="{ name: field().name() }"></span></a>
        </div>
    </div>
</div></div>`
    };
}

maEmbeddedListField.$inject = [];
