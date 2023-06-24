
class Message {

    constructor(id, userId, content, timestamp){
        this.id = id;
        this.userId  = userId;
        this.content = content;
        this.created = timestamp;
    }

    toJson() {
        return {
            "id": this.id,
            "user_id": this.userId,
            "content": this.content,
            "created": this.created
         };
    };

}

module.exports = Message;

