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
        eventDrop: function(event, dayDelta, minuteDelta) {
            var data = {
                _id: event._id,
                id: event.id,
                start: event.start.format(),
                title: event.title,
                desc: event.desc,
                jira: event.jira,
                color: event.color,
                textColor: calEvent.textColor,
                category: event.category,
                user: event.user
            };
            if (event.end) {
                data.end = event.end.format();
            } else {
                if (event.allDay) {
                    data.allDay = true;
                } else {
                    data.end = new Date(event.start + 7200000).toJSON();
                }
            }
            saveEvent(data, true);
        },
        eventResize: function(event, dayDelta, minuteDelta) {
            var data = {
                _id: event._id,
                id: event.id,
                start: event.start.format(),
                title: event.title,
                desc: event.desc,
                jira: event.jira,
                color: event.color,
                textColor: calEvent.textColor,
                category: event.category,
                user: event.user
            };
            if (event.end) {
                data.end = event.end.format();
            } else {
                data.end = new Date(event.start + 3600000 + dayDelta).toJSON();
            }
            saveEvent(data, true);
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
                textColor: calEvent.textColor,
                desc: calEvent.desc,
                user: calEvent.user
            };
            if (calEvent.end) {
                data.end = calEvent.end.format();
                $('#event-editor-header').html(data.start + " - " + data.end);
            } else {
                $('#event-editor-header').html(data.start);
            }
            $('#event-editor-form').populateJson(data);
            $('#event-editor-category-color').css('background-color', data.color);
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

    $('#event-editor-form').on('submit', function() {
        var data = $('#event-editor-form').serializeObject();
        saveEvent(data);
        closeEventEditor();
    });
});

setupCategoryOnChangeHandler = function() {
    var selectedColor = '#' + $('#event-editor-category option:selected').attr('color');
    $('#event-editor-category-color').css('background-color', selectedColor);
    $('#event-editor-color').val(selectedColor);
    $('#event-editor-textColor').val(getTextColor(selectedColor));

    $('#event-editor-category').on('change', function(event) {
        var $option = $("option:selected", this);
        selectedColor = '#' + $option.attr('color');
        $('#event-editor-category-color').css('background-color', selectedColor);
        $('#event-editor-color').val(selectedColor);
        $('#event-editor-textColor').val(getTextColor(selectedColor));
    });
};

renderCategoriesDropdown = function() {
    var categories = $.localStorage('categories');
    if (categories) {
        console.log("categories==");
        console.dir(categories);
        var $dropdown = $('#event-editor-category');
        for (var key in categories) {
            var category = categories[key];
            $dropdown.append($("<option value='" + category.name + "' color='" + category.color + "'>" + category.name + "</option>"));
        }
    }
};

closeEventEditor = function() {
    $('#event-editor-form').trigger('reset');
    $('#event-editor-form').find('input, textarea').val('');
    $('#event-editor').hide();
    $('#event-editor-header').html("");
};

reloadEvents = function() {
    $('#calendar').fullCalendar('refetchEvents');
};

deleteEvent = function() {
    var eventId = $('#event-editor-id').val();
    if (eventId) {
        if (confirm('Sure to delete this event?')) {
            var url = '/calendar/event/delete/' + eventId;
            closeEventEditor();
            $.get(url, function() {
                reloadEvents();
            });
        }
    } else {
        closeEventEditor();
    }
};

saveEvent = function(data, skipUpdatingEvent) {
    try {
        $.post('/calendar/events', data, function(persistedData) {
            if (data._id) {
                if (!skipUpdatingEvent) {
                    $.extend(currentCalEvent, data);
                    $('#calendar').fullCalendar('updateEvent', currentCalEvent);
                }
            } else {
                $('#calendar').fullCalendar('renderEvent', persistedData);
            }
            $('#calendar').fullCalendar('unselect');
        });
    } catch (e) {
        console.log("error: " + e.message);
        console.dir(data);
    }
};

getTextColor = function(bgColor) {
    return isDark(bgColor) ? '#FFF' : '#000';
};

isDark = function(color) {
    try {
        var hex = color.replace(/[^0-9a-z]/gi, '');
        if (3 == hex.length) {
            var sum = parseInt(hex[0], 16) + parseInt(hex[1], 16) + parseInt(hex[2], 16);
            return sum < 3 * 128 / 2;
        } else if (6 == hex.length) {
            var sum = parseInt(hex[0] + hex[1], 16) + parseInt(hex[2] + hex[3], 16) + parseInt(hex[4] + hex[5], 16);
            return sum < 3 * 256 / 2;
        } else {
            return true;
        }
    } catch (e) {
        return true;
    }
};