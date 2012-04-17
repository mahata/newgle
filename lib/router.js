(function () {
    var router = {};

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = router;
    }

    router.domainCheck = function(req, res, next) {
        if (process.env.SERVICE_DOMAIN !== req.headers.host) {
            res.redirect(((req.session.ssl) ? 'https://' : 'http://') + process.env.SERVICE_DOMAIN + req.url);
            return;
        }
        next();
    };
}());
