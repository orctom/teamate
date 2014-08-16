$('#team-form').on('submit', function(event) {
    event.preventDefault();
    $.post('/team/save', $(this).serialize(), function(data) {
        if (data) {
            loadCategories(data);
        }
    });
});

var template = require("../views/templates/user-item.jade");
$('table.table tbody').append(template({
    user: {
        avatarUrl: 'https://ecomsvn.officedepot.com/avatar/hao.chen2',
        name: 'hao chen'
    }
}));
console.log('common.js');