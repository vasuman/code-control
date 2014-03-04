var passport = require('passport'),
util = require('util');

function PragyanStrategy(options, verify) {
    if(options instanceof Function) {
        verify = options;
        options = {};
    }
    passport.Strategy.call(this);
    this.name = 'pragyan';
    this._verify = verify;
    this._key = options.key || 'PHPSESSID';
}

util.inherits(PragyanStrategy, passport.Strategy);

PragyanStrategy.prototype.authenticate = function(req) {
    var sessionID = req.cookies[this._key];
    if(!sessionID) {
        return this.pass();
    }
    var self = this;
    function verify(err, user) {
        if(err) {
            return self.error(err);
        }
        if(user == false) {
            return self.fail();
        }
        self.success(user);
    }
    this._verify(sessionID, verify);
}

module.exports.PragyanStrategy = PragyanStrategy;
