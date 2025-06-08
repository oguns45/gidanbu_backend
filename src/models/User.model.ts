

import mongoose, { Schema, Types, Model, Document } from 'mongoose';
import slugify from 'slugify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserDoc } from "../utils/interface.util";

const UserSchema = new Schema<IUserDoc>(
    {

        cartItems: [
            {
                quantity: {
                    type: Number,
                    default: 1,
                },
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                },
            },
        ],
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
        avatar: {
            type: String,
            default: '',
        },
        username: {
            type: String,
            maxLength: [12, 'username cannot be more than 12 characters'],
        },
        slug: {
            type: String,
            default: '',
        },
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
            select: false, // ✅ Add this line
        },
        phoneNumber: {
            type: String,
            default: '',
        },
        phoneCode: {
            type: String,
            default: '+234',
        },
        // roles: [
        //     {
        //         // type: Schema.Types.Mixed,
        //         type: Types.ObjectId, // Not Mixed
        //         ref: 'Role',
        //     },
        // ],
        resetPasswordToken: {
            type: String,
            default: undefined,
        },
        resetPasswordExpires: {
            type: Date,
            default: undefined,
        },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            transform(doc: any, ret) {
                ret.id = ret._id;
                // delete ret.password; // remove password from returned data
                // delete ret.__v;
                // delete ret._id;
                // return ret;

            },
        },
    }
);

// 🔒 Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Optional: pre-save slug from username
UserSchema.pre('save', function (next) {
    if (this.isModified('username') && this.username) {
        this.slug = slugify(this.username, { lower: true });
    }
    next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    console.log("Password from login request:123", password);
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateTokens = async function (userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET as string, {
        expiresIn: '7d',
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
};


UserSchema.methods.hasRole = async function(roleName: string) {
    const user = await this.populate('roles');
    return user.roles.some((role: any) => role.name === roleName);
  };

const User: Model<IUserDoc> = mongoose.model<IUserDoc>('User', UserSchema);

export default User;
