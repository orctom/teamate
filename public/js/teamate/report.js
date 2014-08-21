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