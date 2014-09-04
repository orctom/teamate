$(function() {
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,basicWeek,agendaDay'
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
        //events: '/activities/events/nick.patel'
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

var renderCategoriesDropdown = function() {
    var categories = $.localStorage('categories');
    if (categories) {
        var $dropdown = $('#event-editor-category');
        for (var name in categories) {
            var color = categories[name].color;
            $dropdown.append($("<option value='" + name + "' color='" + color + "'>" + name + "</option>"));
        }
    }
};

var reloadEvents = function() {
    $('#calendar').fullCalendar('refetchEvents');
};

var previousEventSource;
var loadActivity = function(user) {
    $('#calendar').fullCalendar('removeEvents');
    if (previousEventSource) {
        $('#calendar').fullCalendar('removeEventSource', previousEventSource);
    }
    previousEventSource = '/activities/events/' + user;
    $('#calendar').fullCalendar('addEventSource', previousEventSource);

    $('#commitChartDay, #commitChartHour, #commitCalendar').hide().on('load', function() {
        $(this).fadeIn();
    });
    $('#commitChartDay').prop('src', 'https://ecomsvn.officedepot.com/fe/commitChartDay.do?w=276&h=70&context=user&imageBackgroundColour=FFFFFF&outputtype=image&username=' + user);
    $('#commitChartHour').prop('src', 'https://ecomsvn.officedepot.com/fe/commitChartHour.do?w=276&h=70&context=user&imageBackgroundColour=FFFFFF&outputtype=image&username=' + user);
    $('#commitCalendar').prop('src', 'https://ecomsvn.officedepot.com/fe/commitCalendar.do?outputtype=html&context=user&username=' + user);

    $('.page-header > i').html(user);
};