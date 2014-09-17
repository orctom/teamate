var categoryTemplate = require("../views/templates/category-item.jade");
var taskTemplate = require("../views/templates/task-item.jade");
var tagsTemplate = require("../views/templates/category-tags.jade");
$(function() {
    loadTasks();

    $(".pick-a-color").pickAColor({
        inlineDropdown: true
    });

    $('#task-form').on('submit', function(event) {
        event.preventDefault();
        $.post('/task/save', $(this).serialize(), function(data) {
            if (data) {
                loadTasks();
            }
        });
        $(this).find('input').val('');
        $('#taskModal').modal('hide');
    });

    $('#category-form').on('submit', function(event) {
        event.preventDefault();
        $.post('/task/categories/save', $(this).serialize(), function(data) {
            if (data) {
                loadCategories(data, true);
            }
        });
    });

    var categories = $.localStorage('categories');
    if (categories) {
        loadCategories(categories);
    } else {
        $.get('/task/categories', function(data) {
            if (data) {
                loadCategories(data, true);
            }
        });
    }

    $('.datepicker').datepicker({
        format: "yyyy-mm-dd",
        startDate: "today"
    });

});

var loadTasks = function() {
    $('#tasks tr').remove();
    $.get('/task/list', function(tasks) {
        for (var key in tasks) {
            var task = tasks[key];
            console.log("============");
            console.dir(task);
            $('#tasks').append(taskTemplate(task));
        }
    });
};

var loadCategories = function(categories, persist) {
    if (persist) {
        $.localStorage('cacategorytegories', categories);
    }

    $('#categories tr').remove();
    $('#tags label').remove();
    for (var key in categories) {
        var category = categories[key];
        $('#categories').append(categoryTemplate(category));
        $('#tags').append(tagsTemplate(category));
    }
};

var editCategory = function(id, name, color) {
    $('input[name="_id "]', $('#category-form')).val(id);
    $('input[name="name "]', $('#category-form')).val(name);
    $('input[name="color "]', $('#category-form')).val(color);
};
var deleteCategory = function(id) {
    $.get('/task/category/delete/' + id, function(data) {
        if (data) {
            loadCategories(data, true);
        }
    });
};