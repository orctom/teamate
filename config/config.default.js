var config = module.exports = {};

config.env = 'production';
config.port = 3000;
config.mongodb = {
    url: 'localhost:27017/teamate'
};
config.session = {
    secret: 'hdgfhasgfhasdhfjhj234h2uiorh'
};
config.admins = {
    'hao.chen2': true
};
config.managers = {
    'hao.chen2': true
};
config.scheduler = {
    enabled: true
};