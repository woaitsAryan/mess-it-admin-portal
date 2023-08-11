import { Request } from 'express';
import {UserType} from '../models/userModel'

declare module 'express' {
    interface Request {
        user: UserType; 
    }
}