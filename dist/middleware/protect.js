import * as jwt from 'jsonwebtoken';
import envHandler from '../helpers/envHandler.js';
import catchAsync from '../helpers/catchAsync.js';
import User from '../models/userModel.js';
const jwtVerifyPromisified = (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, {}, (err, payload) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(payload);
            }
        });
    });
};
export const protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1];
    if (!token)
        return res.status(400).json({ error: 'Username must be alphanumeric', verified: false });
    const decoded = await jwtVerifyPromisified(token, envHandler('JWTSecret')).catch((err) => {
        return res.status(400).json({ error: err.message, verified: false });
    });
    const user = await User.findById(decoded.id);
    if (!user) {
        return res.status(400).json({ error: 'User not found', verified: false });
    }
    req.user = user;
    next();
});
//# sourceMappingURL=protect.js.map