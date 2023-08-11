import express from 'express';
import { Logincontroller, Registercontroller } from '../controllers/authcontroller.js';

const auth = express.Router();

auth.post('/register', Registercontroller);
auth.post('/login', Logincontroller);

export default auth;