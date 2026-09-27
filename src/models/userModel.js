const mongoose = require('mongoose');

const ROLES = ['HOUSEHOLD', 'COLLECTOR', 'ADMIN'];
const STATUSES = ['ACTIVE', 'SUSPENDED', 'DELETED'];

const addressSchema = new Schema({
    line1: { type: String, required: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    location:{ 
        type: { type: 
            String, enum: 
            ['Point'] },
             coordinates:{
             type: [Number] ,
             default: undefined
             }
    }
},{_id: false});

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ROLES, required: true, default: 'HOUSEHOLD' },
        status: { type: String, enum: STATUSES, default: 'ACTIVE' },
        address: addressSchema,
        isEmailVerified: { type: Boolean, default: false },
        isCollectorVerified: { type: Boolean, default: false },
        suspensionReason: { type: String, trim: true },
        lastLoginAt: { type: Date },
    },
   {timestamps: true}
);
userSchema.index({'address.location':'2dsphere'});
userSchema.methods.toSafeObjects = function toSafeObject(){
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};
module.export = mongoose.model('User', userSchema);
module.export.ROLES = ROLES;
module.exports.STATUSES = STATUSES;