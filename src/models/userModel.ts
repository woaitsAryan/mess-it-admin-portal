import mongoose, {Document, Schema} from 'mongoose';

export interface UserType extends Document{
    _id: Schema.Types.ObjectId;
    username: string;
    passwordHash: string;
}

const userSchema = new mongoose.Schema<UserType>({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }
});
      
const User = mongoose.model<UserType>('User', userSchema);

export default User;