function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Please login first' });
}

function isAdmin(req, res, next) {
    console.log('isAdmin check - session:', req.session);
    if (req.session.admin) {
        return next();
    }
    console.log('isAdmin failed - no admin session');
    res.status(401).json({ success: false, message: 'Admin access required' });
}

module.exports = { isAuthenticated, isAdmin };
