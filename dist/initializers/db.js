import mongoose from 'mongoose';
import { DB_URL } from '../constants.js';
const URL = DB_URL;
const connectToDB = async () => {
    await mongoose.connect(URL);
    return console.log('Connected to Database!');
};
export default connectToDB;
//# sourceMappingURL=db.js.map