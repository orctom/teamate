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
            var title = event.id ? "<a href='https://officedepot.atlassian.net/browse/" + event.id + "' target='_blank'>" + event.id + "</a>" : "";
            element.qtip({
                position: {
                    my: 'bottom center',
                    at: 'middle center'
                },
                content: {
                    title: title,
                    text: event.title
                },
                hide: {
                    fixed: true
                },
                style: {
                    classes: 'qtip-bootstrap qtip-shadow'
                }
            });
        },
        eventDrop: function(data, dayDelta, minuteDelta) {
            console.dir(dayDelta);
            console.dir(minuteDelta);
            saveEvent(data);
        },
        eventResize: function(data, dayDelta, minuteDelta) {
            console.dir(dayDelta);
            console.dir(minuteDelta);
            saveEvent(data);
        },
        select: function(start, end, jsEvent, view) {
            showEventEditor(jsEvent.pageX, jsEvent.pageY);
        },
        eventClick: function(calEvent, jsEvent, view) {
            var data = {
                id: calEvent.id,
                title: calEvent.title,
                start: calEvent.start,
                end: calEvent.end,
                url: calEvent.url,
                color: calEvent.color,
            };
            showEventEditor(jsEvent.pageX, jsEvent.pageY, data);
        },
        events: '/calendar/events.json'
    });
});

function saveEvent(event) {
    console.log('save/updated event data');
    try {
        var data = {
            id: event.id,
            title: event.title,
            url: event.url,
            color: event.color,
        };
        if (typeof event.start == 'object') {
            data.start = event.start.format();
        } else {
            data.start = event.start;
        }
        if (data.end) {
            data.end = event.end.format();
        }
        console.log("save: " + JSON.stringify(data));
        $.post('/calendar/events', data);
        $('#calendar').fullCalendar('renderEvent', data, true);
        $('#calendar').fullCalendar('unselect');
    } catch (e) {
        console.log("error: " + e.message);
        console.dir(event);
    }
}

function showEventEditor(pageX, pageY, data) {
    $('#event-editor').css({
        left: pageX - 420,
        top: pageY - 280
    }).fadeIn();
    $('#event-save-btn').one('click', function() {
        $('#event-editor').fadeOut();
        saveEvent({
            id: 'id',
            title: 'title',
            start: '2014-07-15',
            url: 'http://www.officedepot.com',
            color: 'blue',
        });
    });
}

function closeEventEditor() {
    $('#event-editor').hide();
}