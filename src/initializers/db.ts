import mongoose from 'mongoose';
import {DB_URL} from '../constants.js';

const URL: string = DB_URL;

const connectToDB = async (): Promise<void> => {
    
    await mongoose.connect(URL);
    return console.log('Connected to Database!');
};

export default connectToDB;
