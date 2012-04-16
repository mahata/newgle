(function () {
    var router = {};

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = router;
    }

    router.domainCheck = function(req, res, next) {
        console.log("Domain check logic should be written here.");
        next();
    };
}());
