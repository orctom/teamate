$(function() {
    $(".pick-a-color").pickAColor({
        inlineDropdown: true
    });
    $('#confirm-delete').on('show.bs.modal', function(e) {
        $(this).find('.danger').attr('href', $(e.relatedTarget).data('href'));
    });
    $('#category-form').on('submit', function(event) {
        event.preventDefault();
        $.post('/task/categories/save', $(this).serialize(), function(data) {
            if (data) {
                loadCategories(data);
            }
        });
    });
    $.get('/task/categories', function(data) {
        if (data) {
            loadCategories(data);
        }
    });
});

function loadCategories(categories) {
    $.localStorage('categories', categories);

    $('#categories tr').remove();
    for (var key in categories) {
        loadCategory(key, categories[key]);
    }
}

function loadCategory(name, color) {
    var row = $("<tr />");
    $('#categories').append(row);
    row.append($("<td><span class='color-box' style='background-color:#" + color + "'></span>" + name + "</td>"));
    row.append($("<td><a class='btn btn-info btn-xs' onclick='editCategory();''><i class='glyphicon glyphicon-edit'></i></a><a class='btn btn-warning btn-xs' data-target='#confirm-delete' data-toggle='modal' href='#'><i class='glyphicon glyphicon-remove'></i></a></td>"));
}