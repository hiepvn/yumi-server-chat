
var axios = require("axios")
var Conf = require('../conf');



class SimpleHttp {

    constructor() {
        axios.defaults.baseURL = Conf.apiServer.host;
    }

    async authen(userToken) {
        return axios.post("/user/authen", {}, {headers: {Authorization: "Token " + userToken}});
    };

    async messageSend(userToken, data) {
        return axios.post("/message/send", data, {headers: {Authorization: "Token " + userToken}});
    };

}


module.exports = SimpleHttp;



