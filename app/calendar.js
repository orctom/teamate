exports.dashboard = function(db) {
    return function(req, res) {
        res.render('calendar/dashboard');
    }
};

exports.events = function(db) {
    return function(req, res) {
        console.log("events");
        var start = req.query.start;
        var end = req.query.end;
        console.log('start: ' + start);
        console.log('end  : ' + end);
        var data = [{
            title: 'All Day Event',
            start: '2014-06-01'
        }, {
            title: 'Long Event',
            start: '2014-06-07',
            end: '2014-06-10'
        }, {
            id: 999,
            title: 'Repeating Event',
            start: '2014-06-09T16:00:00'
        }, {
            id: 999,
            title: 'Repeating Event',
            start: '2014-06-16T16:00:00'
        }, {
            title: 'Meeting',
            start: '2014-06-12T10:30:00',
            end: '2014-06-12T12:30:00'
        }, {
            title: 'Lunch',
            start: '2014-06-12T12:00:00'
        }, {
            title: 'Birthday Party',
            start: '2014-06-13T07:00:00'
        }, {
            title: 'Click for Google',
            start: '2014-07-15'
        }];
        res.json(data);
    }
};

exports.update = function(db) {
    return function(req, res) {
        var data = {
            title: req.body.title,
            start: req.body.start,
            end: req.body.end
        }
        console.log("update");
        console.dir(data);
        res.json('updated');
    }
};