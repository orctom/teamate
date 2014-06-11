exports.refresh = function(db) {
    loadGroups(db);
};

export.loadGroups = function(db) {
    var collection = db.get('groups');
    collection.find({}, {}, function(e, data) {
        return data;
    });
};