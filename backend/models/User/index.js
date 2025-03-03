import { model, Schema } from 'mongoose';

const UserSchema = Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    verificationToken: {
        type: String,
        index: true
    },
    tokenExpiresAt: {
        type: Date
    },
    lastVerificationEmailSent: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    oauthProvider: {
        type: String,
        enum: [ "google", "github", null ],
        default: null
    },
    oauthId: {
        type: String,
        sparse: true,
        unique: true
    },
    profilePicture: {
        type: String,
        default: ""
    },
    rating: {
        type: Number,
        default: 0
    },
    problemsSolved: {
        type: Number,
        default: 0
    },
    submissionHistory: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = model("User", UserSchema, "Users");

export default User;