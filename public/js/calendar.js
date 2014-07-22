var currentCalEvent;

$(function() {
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        selectable: true,
        selectHelper: true,
        editable: true,
        droppable: true,
        eventRender: function(event, element, view) {
            var title = event.jira ? "<a href='https://officedepot.atlassian.net/browse/" + event.jira + "' target='_blank'>" + event.jira + "</a>" : "";
            element.qtip({
                position: {
                    my: 'bottom center',
                    at: 'middle center'
                },
                content: {
                    title: title,
                    text: event.title + '<br/>' + event.desc
                },
                hide: {
                    fixed: true
                },
                style: {
                    classes: 'qtip-bootstrap qtip-shadow'
                }
            });
        },
        eventDrop: function(event, dayDelta, minuteDelta) {
            console.dir(dayDelta);
            console.dir(minuteDelta);
            var data = {
                id: event.id,
                title: event.title,
                desc: event.desc,
                jira: event.jira,
                color: event.color,
                category: event.category,
            };
            if (typeof event.start == 'object') {
                data.start = event.start.format();
                if (data.end) {
                    data.end = event.end.format();
                }
            } else {
                data.start = event.start;
                if (data.end) {
                    data.end = event.end;
                }
            }
            saveEvent(data);
        },
        eventResize: function(event, dayDelta, minuteDelta) {
            console.dir(dayDelta);
            console.dir(minuteDelta);
            var data = {
                id: event.id,
                title: event.title,
                desc: event.desc,
                jira: event.jira,
                color: event.color,
                category: event.category,
            };
            if (typeof event.start == 'object') {
                data.start = event.start.format();
                if (data.end) {
                    data.end = event.end.format();
                }
            } else {
                data.start = event.start;
                if (data.end) {
                    data.end = event.end;
                }
            }
            saveEvent(data);
        },
        select: function(start, end, jsEvent, view) {
            $('#event-editor').fadeIn();
            $('#event-editor-start').val(start.format());
            if (end) {
                $('#event-editor-end').val(end.format());
                $('#event-editor-header').html(start.format() + " - " + end.format());
            } else {
                $('#event-editor-header').html(start.format());
            }
        },
        eventClick: function(calEvent, jsEvent, view) {
            var data = {
                _id: calEvent._id,
                id: calEvent.id,
                title: calEvent.title,
                start: calEvent.start.format(),
                end: '',
                jira: calEvent.jira,
                category: calEvent.category,
                color: calEvent.color,
                desc: calEvent.desc
            };
            if (calEvent.end) {
                data.end = calEvent.end.format();
                $('#event-editor-header').html(data.start + " - " + data.end);
            } else {
                $('#event-editor-header').html(data.start);
            }
            $('#event-editor-form').populateJson(data);
            $('#event-editor').fadeIn();
            currentCalEvent = calEvent;
        },
        events: '/calendar/events'
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

    setupCategoryOnChangeHandler();
});

setupCategoryOnChangeHandler = function() {
    var selectedColor = '#' + $('#event-editor-category option:selected').attr('color');
    $('#event-editor-category-color').css('background-color', selectedColor);
    $('#event-editor-color').val(selectedColor);

    $('#event-editor-category').on('change', function(event) {
        var $option = $("option:selected", this);
        selectedColor = '#' + $option.attr('color');
        $('#event-editor-category-color').css('background-color', selectedColor);
        $('#event-editor-color').val(selectedColor);
    });
}

renderCategoriesDropdown = function() {
    var categories = $.localStorage('categories');
    if (categories) {
        var $dropdown = $('#event-editor-category');
        for (var name in categories) {
            var color = categories[name];
            $dropdown.append($("<option value='" + name + "' color='" + color + "'>" + name + "</option>"));
        }
    }
}

closeEventEditor = function() {
    $('#event-editor-form').trigger('reset');
    $('#event-editor-form').find('input, textarea').val('');
    $('#event-editor').hide();
    $('#event-editor-header').html("");
}

saveFromEventEditor = function(event) {
    event.preventDefault();
    var data = $('#event-editor-form').serializeObject();
    saveEvent(data);
    closeEventEditor();
}

saveEvent = function(data) {
    console.log('save/updated event data');
    try {
        console.log("save: " + JSON.stringify(data));
        $.post('/calendar/events', data, function(persistedData) {
            if (data._id) {
                $.extend(currentCalEvent, data);
                $('#calendar').fullCalendar('updateEvent', currentCalEvent);
            } else {
                $('#calendar').fullCalendar('renderEvent', persistedData);
            }
            $('#calendar').fullCalendar('unselect');
        });
    } catch (e) {
        console.log("error: " + e.message);
        console.dir(event);
    }
}