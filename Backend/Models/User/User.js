import { model, Schema } from "mongoose";

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        requried: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = model('User', UserSchema);
export default User;