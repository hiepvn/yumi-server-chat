
class Comment {

    constructor(userId, text, timestamp){
        this.userId  = userId;
        this.text    = text;
        this.created = timestamp;
    }

    toJson() {
        return {
            "user_id":this.userId,
            "text":this.text,
            "created":this.ts
        };
    }

}

module.exports = Comment;

