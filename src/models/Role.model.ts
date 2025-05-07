import mongoose, { Schema, Types, Model, ObjectId } from 'mongoose'
import { IRoleDoc } from '../utils/interface.util'
import slugify from 'slugify'

const RoleSchema = new Schema(
    {
        name: {
            type: String,
            unique: [true, 'role already exist with this name'],
            default: ''
        },

        description: {
            type: String,
            maxLength: 200,
            default: ''
        },

        slug: {
            type: String,
            default: ''
        },

        users: [
            {
                type: Schema.Types.Mixed,
                ref: 'User'
            }
        ]
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            transform(doc: any, ret){
                ret.id = ret._id
            }
        }
    }
);

RoleSchema.set('toJSON', { virtuals: true, getters: true })

RoleSchema.pre<IRoleDoc>('save', async function(next) {
    
    this.slug = slugify(this.name, { lower: true, replacement: '-'})

    next();
})

// RoleSchema.post<IRoleDoc>('save', async function(next){

// })

RoleSchema.statics.getAll = async () => {
    return await Role.find({})
}

RoleSchema.methods.findByName = async (name: string) => {
    const role = await Role.findOne({ name: name });
    return role ? role : null;
}

//define model name
const Role: Model<IRoleDoc> = mongoose.model<IRoleDoc>('Role', RoleSchema)

export default Role;