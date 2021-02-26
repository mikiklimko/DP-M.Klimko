module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Prosim prihlaste sa ');
        res.redirect('/users/login');
    }
}