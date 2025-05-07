// import mongoose, { Schema, Types, Model}  from 'mongoose'
// import slug from 'slugify'
// import { IUserDoc } from '../utils/interface.util'
// import slugify from 'slugify'
// import bcrypt, { genSalt, compare } from 'bcrypt'
// import jwt from 'jsonwebtoken'

// const UserSchema = new Schema(
//     {
//         avatar: {
//             type: String,
//             default: ''
//         },

//         username: {
//             type: String,
//             maxLength: [12, 'username cannot be more than 8 characters'],
//         },

//         email: {
//             type: String,
//             unique: [true, 'user already exists'],
//         },

//         password: {
//             type: String,
//             default: '',
//             select: false
//         },

//         slug: {
//             type: String,
//             default: ''
//         },

//         firstName: {
//             type: String,
//             default: ''
//         },

//         lastName: {
//             type: String,
//             default: ''
//         },

//         phoneNumber: {
//             type: String,
//             default: ''
//         },

//         phoneCode: {
//             type: String,
//             default: '+234'
//         },

//         roles: [
//             {
//                 type: Schema.Types.Mixed,
//                 ref: 'Role'
//             }
//         ]
 
//     },
//     {
//         timestamps: true,
//         versionKey: '_version',
//         toJSON: {
//             transform(doc: any, ret){
//                 ret.id = ret._id
//             }
//         }
//     }
// )

// UserSchema.set('toJSON', { virtuals: true, getters: true })

// UserSchema.pre<IUserDoc>('save', async function (next) {
    
//     if (this.isModified('password')) {
//         const salt = await genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//     }

//     this.slug = slugify(this.email, { lower: true, replacement: '-'})

//     next()

// });

// UserSchema.methods.matchPassword = async function (password: string) {
//     let result: boolean = false;

//     if (this.password && this.password !== '') {
//        result = await bcrypt.compare(password, this.password)
//     }

//     return result;
// }

// UserSchema.methods.getAuthToken = async function () {
//     const secret = process.env.JWT_SECRET;
//     const expire = process.env.JWT_EXPIRE;
//     let token: string = '';

//     if (secret) {
//            token = jwt.sign(
//             { 
//                 id: this._id, 
//                 email: this.email, 
//                 roles: this.roles 
//             }, 
//             secret,
//             {
//                 algorithm: 'HS512',
//                 expiresIn: expire 
//             }
//         )     
//     }

//     return token
// }

// UserSchema.statics.getUsers = async () => {
//     return await User.find({})
// }

// UserSchema.statics.findById = async (id: any) => {
//     const user = await User.findOne({ _id: id });

//     return user ? user : null;
// }

// const User: Model<IUserDoc> = mongoose.model<IUserDoc>('User', UserSchema);

// export default User;


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
            maxLength: [12, 'username cannot be more than 8 characters'],
        },
        slug: {
            type: String,
            default: '',
        },
        firstName: {
            type: String,
            required: [true, "First name is required"],
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
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
        },
        phoneNumber: {
            type: String,
            default: '',
        },
        phoneCode: {
            type: String,
            default: '+234',
        },
        roles: [
            {
                type: Schema.Types.Mixed,
                ref: 'Role',
            },
        ],
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
            },
        },
    }
);

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

UserSchema.methods.generateTokens = async function (userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET as string, {
        expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
};

const User: Model<IUserDoc> = mongoose.model<IUserDoc>('User', UserSchema);

export default User;