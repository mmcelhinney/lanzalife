"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = void 0;
const authorizeRole = (roles) => {
    return (req, res, next) => {
        // @ts-ignore
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have the necessary permissions' });
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
