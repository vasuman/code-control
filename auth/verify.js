var req = require('request');

function cbackWrapper(cback) {
    return function(err, msg, resp) {
        if(err) {
            return cback(err);
        }
        try {
            var r_code = parseInt(resp);
        } catch(e) {
            cback(e);
        }
        if(r_code == -1) {
            cback(null, false);
        } else {
            cback(null, { pid: r_code });
        }
    }
}

const VERIFY_URL = 'http://pragyan.org/14/cms/codecharacter.php?kookie='
function verifyCookie(kookie, cback) {
    var get = req.get(VERIFY_URL + kookie, cbackWrapper(cback));
}

module.exports.verifyCookie = verifyCookie;
