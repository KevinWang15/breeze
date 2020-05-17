const Authenticator = require("./authenticator");

class NoAuth extends Authenticator {
    getAuthenticatorName() {
        return "noauth";
    }

    authenticate(params) {
        return params.user;
    }
}

module.exports = new NoAuth();