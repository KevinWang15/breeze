const authenticators = require("./authenticator");

function getAuthenticatedUser(req) {
    try {
        const params = JSON.parse(req.headers.authentication);
        for (let authenticator of authenticators) {
            if (authenticator.getAuthenticatorName() === params.type) {
                return authenticator.authenticate(params);
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

module.exports = getAuthenticatedUser;