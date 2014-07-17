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
            $('#event-editor').fadeIn();
        },
        eventClick: function(calEvent, jsEvent, view) {
            console.log('event click: ');
            console.dir(calEvent);
            var data = {
                id: calEvent.id,
                title: calEvent.title,
                start: calEvent.start,
                end: calEvent.end,
                url: calEvent.url,
                color: calEvent.color,
                desc: calEvent.desc
            };
            $('#event-editor-id').val(data.id);
            $('#event-editor-start').val(data.start);
            $('#event-editor-end').val(data.end);
            $('#event-editor-title').val(data.title);
            $('#event-editor-desc').val(data.desc);
            $('#event-editor-url').val(data.url);
            $('#event-editor-color').val(data.color);
            $('#event-editor').fadeIn();
        },
        events: '/calendar/events'
    });

    $(".pick-a-color").pickAColor({
        inlineDropdown: true,
        showHexInput: false
    });
});

function showEventEditor(pageX, pageY, data) {
    $('#event-editor').fadeIn();
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
    $('#event-editor-form').trigger('reset');
    $('#event-editor-form').find('input, textarea').val('');
    $('#event-editor').hide();
}

function saveFromEventEditor(event) {
    event.preventDefault();
    var data = {
        id: $('#event-editor-id').val(),
        start: $('#event-editor-start').val(),
        end: $('#event-editor-end').val(),
        title: $('#event-editor-title').val(),
        desc: $('#event-editor-desc').val(),
        jira: $('#event-editor-jira').val(),
        url: $('#event-editor-url').val(),
        color: $('#event-editor-color').val()
    };
    closeEventEditor();
}

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