$(function() {
    $(".pick-a-color").pickAColor({
        inlineDropdown: true
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

loadCategories = function(categories) {
    $.localStorage('categories', categories);

    $('#categories tr').remove();
    for (var key in categories) {
        loadCategory(categories[key]);
    }
};

loadCategory = function(category) {
    var row = $("<tr />");
    $('#categories').append(row);
    var nameCell = "<span class='color-box' style='background-color:#" + category.color + "'></span>" + category.name;
    var editHandler = 'editCategory("' + category._id + '", "' + category.name + '", "' + category.color + '");';
    var deleteHandler = 'deleteCategory("' + category._id + '");';
    var editLink = "<a class='btn btn-info btn-xs' href='#' onclick='" + editHandler + "'><i class='glyphicon glyphicon-edit'></i></a>";
    var deleteLink = "<a class='btn btn-warning btn-xs' data-target='#confirm-delete' data-toggle='modal' href='#' data-onclick='" + deleteHandler + "'><i class='glyphicon glyphicon-remove'></i></a>";
    row.append($('<td>', {
        html: nameCell
    }));
    row.append($('<td>', {
        html: editLink + deleteLink
    }));
};

editCategory = function(id, name, color) {
    $('input[name="_id "]', $('#category-form')).val(id);
    $('input[name="name "]', $('#category-form')).val(name);
    $('input[name="color "]', $('#category-form')).val(color);
};
deleteCategory = function(id) {
    $.get('/task/category/delete/' + id, function(data) {
        if (data) {
            loadCategories(data);
        }
    });
};