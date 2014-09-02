var template = require("../views/templates/team-item.jade");

var renderTeam = function(team) {
    var html = template(team);
    if (team.update) {
        var $teamPanel = $('#team-' + team._id);
        $('.title', $teamPanel).html(team.name);
        $('a[data-name]', $teamPanel).data('name', team.name);
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
            $.post('/user/team/update', {
                teamId: teamId,
                userId: userId
            }, function(data) {});
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
            refreshMenu();
        }
    });
    $this.trigger('reset');
    $this.find('input').val('');
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
    if (name) {
        $('#team-form-name').val(name);
    }
    $('#team-form-name').focus();
});

/**
 * delete confirm modal show handler: delete team
 */
$('#confirm-delete').on('show.bs.modal', function(e) {
    var $modal = $(this);
    var $target = $(e.relatedTarget);
    var _id = $target.data('id');
    $modal.find('.danger').bind('click', function() {
        $modal.find('.danger').unbind();
        $.post('/team/delete/' + _id, function(data) {
            if (data && data._id) {
                $('#team-' + data._id).fadeOut();
                refreshMenu();
            }
        });
        $modal.modal('hide');
    });
});

// ============ menu activity teams ==============
var refreshMenu = function() {
    require('./nav').refreshMenu(true);
};

/**
 * type filter ungroupped users
 */
$('#userfilter').keyup(function() {
    var rex = new RegExp($(this).val(), 'i');
    $('#ungrouped-users tr:not(:first)').hide();
    $('#ungrouped-users tr:not(:first)').filter(function() {
        return rex.test($(this).text());
    }).show();
});