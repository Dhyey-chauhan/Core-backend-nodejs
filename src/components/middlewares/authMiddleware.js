// src/middlewares/authMiddleware.js

import jwt from 'jsonwebtoken'; 
import { sendFailure } from '../utils/commonUtils.js';
import config from '../../../config/index.js';

const jwtAccessSecret = config.JWT_ACCESS_SECRET;

const authenticateUser = (req, res, next) => {
    const token = req.cookies.accessToken; 
    
    if (!token) {
        return sendFailure(res, 'access token denied', 401);
    }

    try {
        const decodedToken = jwt.verify(token, jwtAccessSecret);
        console.log(decodedToken);

        req.headers['userid'] = decodedToken.id;
        
        next();
    } catch (error) {
        return sendFailure(res, 'access token denied', 401);
    }
};

export default authenticateUser;
