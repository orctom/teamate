$('#calendar').fullCalendar({
    header: {
        left: 'title',
        center: '',
        right: ''
    },
    defaultView: 'agendaDay',
    height: 650,
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