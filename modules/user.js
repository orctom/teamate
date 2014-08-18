var template = require("../views/templates/team-item.jade");

var renderTeam = function(team) {
    var html = template(team);
    if (team.update) {
        $('#' + team._id).replaceWith(html);
    } else {
        $('#teamContainer').append(html);
        enableDragDrop();
    }
};


var isTeamChanged = false;
var enableDragDrop = function() {
    $('.dragdrop').sortable({
        connectWith: '.dragdrop',
        cursor: 'move',
        cursorAt: {
            left: 5
        },
        items: '> tr:not(:first)',
        tolerance: 'pointer',
        start: function(event, ui) {
            isTeamChanged = false;
        },
        stop: function(event, ui) {
            if (!isTeamChanged) {
                $(this).sortable('cancel');
            }
        },
        receive: function(event, ui) {
            isTeamChanged = true;
            var teamId = $(event.target).prop('id');
            var userId = ui.item.prop('id');
            console.log("team id = " + teamId);
            console.log("user id = " + userId);
            console.log('persist...');
            $.post('/user/team/update', {
                teamId: teamId,
                userId: userId
            }, function(data) {
                console.log("===== persited =====");
                console.dir(data);
            });
        }
    }).disableSelection();
};

enableDragDrop();

/**
 * team modal onsubmit handler
 */
$('#team-form').on('submit', function(event) {
    event.preventDefault();
    var $this = $(this);
    $.post('/team/save', $this.serialize(), function(data) {
        if (data) {
            renderTeam(data);
        }
    });
    $this.trigger('reset');
    $('#teamModal').modal('hide');
});

/**
 * team modal on show handler: populate data for edit
 */
$('#teamModal').on('show.bs.modal', function(e) {
    var $modal = $(this);
    var $target = $(e.relatedTarget);
    var _id = $target.data('id');
    var name = $target.data('name');

    if (_id) {
        $('#team-form-id').val(_id);
        $modal.find('.modal-title').html('Edit Team');
    } else {
        $modal.find('.modal-title').html('Add Team');
    }
    $('#team-form-name').val(name);
});

/**
 * delete confirm modal show handler: delete team
 */
$('#confirm-delete').on('show.bs.modal', function(e) {
    var $modal = $(this);
    var $target = $(e.relatedTarget);
    var _id = $target.data('id');
    $modal.find('.danger').bind('click', function() {
        $.post('/team/delete/' + _id, function(data) {
            if (data && data._id) {
                $('#' + data._id).fadeOut();
            }
        });
        $modal.modal('hide');
    });
});