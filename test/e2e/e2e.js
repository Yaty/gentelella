const {uri} = require('./config');

module.exports = {
    ['demo'](browser) {
        browser
            .url(uri)
            .waitForElementVisible('body', 1000)
            .end();
    },
};
