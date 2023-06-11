/**
 * Created by hiepvn on 2023/06/11.
 */

class User {

    constructor(id, token, name, gender, birthday, avatar) {
        this.id = id;
        this.token = token;
        this.name = name;
        this.gender = gender;
        this.birthday = birthday;
        this.avatar = avatar;
    }

    toJson() {
        return {"id":this.id, "name":this.name, "gender":this.gender, "birthday":this.birthday, "avatar": this.avatar};
    };

}

module.exports = User;