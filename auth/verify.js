var request = require('request');

var customUserPass = {
	usernameField: 'email',
	passwordField: 'pass'
};

const PRAGYAN_EVENT_ID = 17;
const USER_AUTH_URL = 'https://api.pragyan.org/user/getDetails';
const EVENT_AUTH_URL = 'https://api.pragyan.org/user/eventauth';

function verifyCreds(email, password, done) {
	console.log("Email: " + email);
	console.log("Password: " + password);
	request.post(
        USER_AUTH_URL, {
            form: {
                'user_email' : email,
                'user_pass' : password
            }
        }, function (err, res, body) {
			body = JSON.parse(body);
			if (err) {
				return done(err);
			}
			if (res.statusCode != 200) {
				return done(err);
			}
			if (body.status == 0) {
				return done(null, false, { message: 'Incorrect username or password' });
			}
			if (body.status == 3) {
				return done(null, false, { message: 'Register on www.pragyan.org' });
			}
			if (body.status == 2) {
				return done(null, { pid: body.data.user_id });
			}
			done(null, false);
    });
}

module.exports.verifyCreds = verifyCreds;
module.exports.customUserPass = customUserPass;
