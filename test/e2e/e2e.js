const {uri} = require('./config');

function add(browser, text) {
    return browser.setValue('.new-todo', [text, browser.Keys.ENTER]);
}

module.exports = {
    after(browser){
        browser.end();
    },

    before(browser) {
        browser.url(uri);
    },

    afterEach(browser, done) {
        browser.execute('app.cleanTodo()', done);
    },

    ['Page should be initialized'](browser) {
        browser
            .waitForElementVisible('body')
            .waitForElementVisible('#app')
            .waitForElementVisible('#todo')
    },

    ['Can add a todo'](browser) {
        const text = 'e2e-testing';

        add(browser, text)
            .elements('css selector','.todo-list', function(result) {
                browser.assert.equal(result.value.length, 1);
                browser.elementIdText(result.value[0].ELEMENT, function(result){
                    browser.assert.equal(result.value, text);
                });
            });
    },

    ['Can check a todo'](browser) {
        const text = 'e2e-testing';

        add(browser, text)
            .click('.todo-list :first-child input[type=checkbox]')
            .assert.cssClassPresent('.todo-list :first-child', 'completed');
    },

    ['Can uncheck a todo'](browser) {
        const text = 'e2e-testing';

        add(browser, text)
            .click('.todo-list :first-child input[type=checkbox]')
            .assert.cssClassPresent('.todo-list :first-child', 'completed')
            .click('.todo-list :first-child input[type=checkbox]')
            .assert.cssClassNotPresent('.todo-list :first-child', 'completed');
    },

    ['Can delete a todo'](browser) {
        const text = 'e2e-testing';

        add(browser, text)
            .execute(function() {
                document.querySelector('.todo-list :first-child button[class=destroy]').click()
            })
            .assert.elementNotPresent('.todo-list :first-child');

    },

    /**
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
**/
};
