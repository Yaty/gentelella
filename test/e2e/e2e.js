const {uri} = require('./config');

module.exports = {
    ['Page should be initialized'](browser) {
        browser
            .url(uri)
            .waitForElementVisible('body')
            .waitForElementVisible('#app')
            .waitForElementVisible('#todo')
            .end();
    },

    ['Can add a todo'](browser) {

    },

    ['Can check a todo'](browser) {

    },

    ['Can unckeck a todo'](browser) {

    },

    ['Can delete a todo'](browser) {

    },

    ['Can update a todo'](browser) {

    },

    ['All filter show all to-dos (todo, active, completed)'](browser) {

    },

    ['Active filter show only active to-dos'](browser) {

    },

    ['Completed filter show only completed to-dos'](browser) {

    },

    ['Counter of to-dos is correct'](browser) {

    },

    ['Text is well set'](browser) {

    },

    ['To-dos are persisted in session'](browser) {

    },

    ['Remove button is not always visible'](browser) {

    },

    ['Remove button is visible'](browser) {

    },

    ['Remove button is removing all to-dos'](browser) {

    },

    ['Style is well defined'](browser) {

    }

};
