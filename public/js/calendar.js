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
        select: function(start, end) {
            var title = prompt('Event Title:');
            var eventData;
            if (title) {
                eventData = {
                    title: title,
                    start: start,
                    end: end
                };
                $('#calendar').fullCalendar('renderEvent', eventData, true);
                saveEvent(eventData);
            }
            $('#calendar').fullCalendar('unselect');
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
        eventClick: function(calEvent, jsEvent, view) {
            var data = {
                id: calEvent.id,
                title: calEvent.title,
                start: calEvent.start,
                end: calEvent.end,
                url: calEvent.url,
                color: calEvent.color,
            };
            console.log("click: " + JSON.stringify(data));
        },
        events: '/calendar/events.json'
    });
});

function saveEvent(event) {
    try {
        var data = {
            id: event.id,
            title: event.title,
            start: event.start.format(),
            url: event.url,
            color: event.color,
        };
        if (data.end) {
            data.end = event.end.format();
        }
        console.log("save: " + JSON.stringify(data));
        $.post('/calendar/events', data);
    } catch (e) {
        console.log("error: " + e.message);
        console.dir(event);
    }
}