var config = module.exports = {};

config.port = 3000;
config.mongodb = {
    url: 'localhost:27017/teamate'
};
config.session = {
    secret: 'hdgfhasgfhasdhfjhj234h2uiorh'
};
config.privilege = {
    'hao.chen2': 'admin'
};
config.scheduler = {};