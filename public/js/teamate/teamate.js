$(function() {
    $('#side-menu').metisMenu({
        toggle: false
    });
    $('#servers').metisMenu({
        toggle: false
    });

    $('table').on('click', 'tbody tr', function(event) {
        $(this).addClass('highlight').siblings().removeClass('highlight');
    });
});

(function($) {
    $.fn.serializeObject = function() {
        "use strict";

        var result = {};
        var extend = function(i, element) {
            var node = result[element.name];

            if ('undefined' !== typeof node && node !== null) {
                if ($.isArray(node)) {
                    node.push(element.value);
                } else {
                    result[element.name] = [node, element.value];
                }
            } else {
                result[element.name] = element.value;
            }
        };

        $.each(this.serializeArray(), extend);
        return result;
    };
})(jQuery);

(function($) {
    $.fn.populateJson = function(json) {
        "use strict";

        var $this = this;
        $.each(json, function(key, value) {
            $('[name=' + key + ']', $this).val(value);
        });
    };
})(jQuery);