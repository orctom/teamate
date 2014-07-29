$('#team-form').on('submit', function(event) {
    event.preventDefault();
    $.post('/team/save', $(this).serialize(), function(data) {
        if (data) {
            loadCategories(data);
        }
    });
});