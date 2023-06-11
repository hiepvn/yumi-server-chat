var ConfigLocal = require('./conf_local.js');

module.exports = {
    server: {
        port: 3000
    },

    apiServer: {
        host: ConfigLocal.api_server.host
    },

    logPath: "../log",

    MAX_USERS_PER_ROOM: 100,

    IS_DEBUG: ConfigLocal.IS_DEBUG,

    IMAGE_FOLDER: ConfigLocal.IMAGE_FOLDER,
    IMAGE_URL:    ConfigLocal.IMAGE_URL

}
