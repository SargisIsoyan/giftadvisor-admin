/**
 * Created by sargis.isoyan on 23/05/2017.
 */
/**
 * Generic edition field
 *
 * @example <ma-input-field type="text" field="field" value="value"></ma-input-field>
 */
export default function maColorPicker() {
    return {
        scope: {
            'type': '@',
            'step': '@?',
            'field': '&',
            'value': '='
        },
        restrict: 'E',
        link: function(scope, element) {
            var field = scope.field();
            scope.name = field.name();
            scope.v = field.validation();
            var input = element.children()[0];
            var attributes = field.attributes();
            for (var name in attributes) {
                if (name === 'step') {
                    scope.step = attributes[name];
                    continue;
                }

                input.setAttribute(name, attributes[name]);
            }
        },
        template:
            `<input type="{{ type || 'text' }}" ng-attr-step="{{ step }}" ng-model="value"
    id="{{ name }}" name="{{ name }}" class="form-control" color-picker color-picker-model="value"
    ng-required="v.required" ng-minlength="v.minlength" ng-maxlength="v.maxlength" ng-pattern="v.pattern" />`
    };
}

maColorPicker.$inject = [];