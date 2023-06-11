
class Message {

    constructor(userId, text, timestamp){
        this.userId  = userId;
        this.body    = body;
        this.created = timestamp;
    }

    toJson() {
        return {
            "user_id": this.userId,
            "text":    this.body,
            "created": this.created
         };
    };

}

module.exports = Message;

