var template = require("../views/templates/nav-activity-item.jade");
var $activityMenu = $('#activities');
exports.refreshMenu = function(forceReload) {
    $activityMenu.empty();

    var teams = $.localStorage('teams');
    if (!teams || forceReload) {
        $.get('/teams', function(data) {
            teams = data;
            $.localStorage('teams', teams);
            appendTeamToMenu(teams);
        });
    } else {
        appendTeamToMenu(teams);
    }
};

var appendTeamToMenu = function(teams) {
    for (var key in teams) {
        var team = teams[key];
        $activityMenu.append(template(team));
    }
    highlightActiveItem();
};

var highlightActiveItem = function() {
    $('#side-menu').find('li').children('a').each(function() {
        if ($(this).prop('href') == location) {
            $(this).parent().addClass('active').parent().addClass('collapse in').parent().addClass('collapse in');
        }
    });
};

exports.refreshMenu();