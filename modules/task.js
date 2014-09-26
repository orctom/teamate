var categoryTemplate = require("../views/templates/category-item.jade");
var taskTemplate = require("../views/templates/task-item.jade");
var tagsTemplate = require("../views/templates/category-tags.jade");

var initCategories = function() {
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
};

var initColerPicker = function() {
    $(".pick-a-color").pickAColor({
        inlineDropdown: true
    });
};

var initDatePicker = function() {
    $('.datepicker').datepicker({
        format: "yyyy-mm-dd",
        startDate: "today"
    });
};

var setupTaskFormSubmitHandler = function() {
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
};

var setupCategoryFormSubmitHandler = function() {
    $('#category-form').on('submit', function(event) {
        event.preventDefault();
        $.post('/task/categories/save', $(this).serialize(), function(data) {
            if (data) {
                loadCategories(data, true);
            }
        });
    });
};

var loadTasks = function() {
    $('#tasks tr').remove();
    $.get('/task/list', function(tasks) {
        var categories = $.localStorage('categories');
        for (var key in tasks) {
            var task = tasks[key];
            var tags = task.tags;
            if ("object" === typeof tags) {
                for (var i in tags) {
                    var tag = tags[i];
                    tags[i] = categories[tag];
                }
            } else {
                task.tags = [categories[tags]];
            }
            $('#tasks').append(taskTemplate(task));
        }
    });
};

var loadCategories = function(categories, persist) {
    if (persist) {
        $.localStorage('categories', categories);
    }

    $('#categories tr').remove();
    $('#tags label').remove();
    for (var key in categories) {
        var category = categories[key];
        $('#categories').append(categoryTemplate(category));
        $('#tags').append(tagsTemplate(category));
    }

    loadTasks();
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


initCategories();
initColerPicker();
initDatePicker();
setupTaskFormSubmitHandler();
setupCategoryFormSubmitHandler();