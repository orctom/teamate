var reload = function() {
    var start = $("#start").val();
    var end = $("#end").val();
    if (start && end) {
        var url = '/report?start=' + start + '&end=' + end;
        window.location.href = url;
    }
};

$('#datepicker').datepicker({
    format: "yyyy-mm-dd",
    endDate: "today"
});

var loadJiraInfo = function() {
    var jiras = '';
    $('#changes').find('a[href]').each(function() {
        jiras += $(this).text() + "+";
    });
    $.getJSON('jiras/' + jiras, null, function(datas) {
        $('#changes').find('a[jira]').each(function() {
            var jira = $(this).text();
            $('<span>', {
                html: datas[jira] ? datas[jira].summary : ''
            }).insertAfter($(this));
            $('<span>', {
                html: ' - '
            }).insertAfter($(this));
        });
    });
};

loadJiraInfo();