$(function() {
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        selectable: true,
        selectHelper: true,
        editable: false,
        droppable: false,
        eventRender: function(event, element, view) {
            var title = event.jira ? "<a href='https://officedepot.atlassian.net/browse/" + event.jira + "' target='_blank'>" + event.jira + "</a>" : "";
            var content = event.title;
            if (event.desc) {
                content += '<br/>' + event.desc;
            }
            element.qtip({
                position: {
                    my: 'bottom center',
                    at: 'middle center'
                },
                content: {
                    title: title,
                    text: content
                },
                hide: {
                    fixed: true
                },
                style: {
                    classes: 'qtip-bootstrap qtip-shadow'
                }
            });
        },
        events: '/activities/events/nick.patel'
        //events: '/activities/changes/patrick.wunier'
    });

    $(".pick-a-color").pickAColor({
        inlineDropdown: true
    });

    if (!$.localStorage('categories')) {
        $.get('/task/categories', function(data) {
            $.localStorage('categories', data);
            renderCategoriesDropdown();
        });
    } else {
        renderCategoriesDropdown();
    }
});

renderCategoriesDropdown = function() {
    var categories = $.localStorage('categories');
    if (categories) {
        var $dropdown = $('#event-editor-category');
        for (var name in categories) {
            var color = categories[name].color;
            $dropdown.append($("<option value='" + name + "' color='" + color + "'>" + name + "</option>"));
        }
    }
};

reloadEvents = function() {
    $('#calendar').fullCalendar('refetchEvents');
};