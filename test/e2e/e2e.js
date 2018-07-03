const {uri} = require('./config');

function add(browser, text) {
    return browser.setValue('.new-todo', [text, browser.Keys.ENTER]);
}

const text = 'e2e-testing';

module.exports = {
    after(browser){
        browser.end();
    },

    before(browser) {
        browser.url(uri);
    },

    afterEach(browser, done) {
        browser.click('.todoapp .filters :nth-child(1) a');
        browser.execute('app.cleanTodo()', done);
    },

    ['Page should be initialized'](browser) {
        browser
            .waitForElementVisible('body')
            .waitForElementVisible('#app')
            .waitForElementVisible('#todo')
    },

    ['Can add a todo'](browser) {
        add(browser, text)
            .elements('css selector','.todo-list', function(result) {
                browser.assert.equal(result.value.length, 1);
                browser.elementIdText(result.value[0].ELEMENT, function(result){
                    browser.assert.equal(result.value, text);
                });
            });
    },

    ['Can check a todo'](browser) {
        add(browser, text)
            .click('.todo-list :first-child input[type=checkbox]')
            .assert.cssClassPresent('.todo-list :first-child', 'completed');
    },

    ['Can uncheck a todo'](browser) {
        add(browser, text)
            .click('.todo-list :first-child input[type=checkbox]')
            .assert.cssClassPresent('.todo-list :first-child', 'completed')
            .click('.todo-list :first-child input[type=checkbox]')
            .assert.cssClassNotPresent('.todo-list :first-child', 'completed');
    },

    ['Can delete a todo'](browser) {
        add(browser, text)
            .execute(function() {
                document.querySelector('.todo-list :first-child button[class=destroy]').click()
            })
            .assert.elementNotPresent('.todo-list :first-child');

    },

    ['Can update a todo'](browser) {
        const updatedText = 'updated!';

        add(browser, text)
            .moveToElement('.todo-list :first-child label', 10, 10)
            .doubleClick()
            .assert.cssClassPresent('.todo-list :first-child', 'editing')
            .setValue('.todo-list :first-child input[class=edit]', [updatedText, browser.Keys.ENTER])
            .elements('css selector','.todo-list', function(result) {
                browser.assert.equal(result.value.length, 1);
                browser.elementIdText(result.value[0].ELEMENT, function(result){
                    browser.assert.equal(result.value, text + updatedText);
                });
            });
    },

    ['All filter show all to-dos (todo, active, completed)'](browser) {
        add(browser, text);

        add(browser, text + '-2')
            .click('.todo-list :first-child input[type=checkbox]')
            .click('.todoapp .filters :first-child a')
            .assert.elementCount('.todo-list li', 2);
    },

    ['Active filter show only active to-dos'](browser) {
        add(browser, text);

        add(browser, text + '-2')
            .click('.todo-list :first-child input[type=checkbox]')
            .click('.todoapp .filters :nth-child(2) a')
            .assert.elementCount('.todo-list li', 1);
    },

    ['Completed filter show only completed to-dos'](browser) {
        add(browser, text)
            .click('.todoapp .filters :nth-child(3) a')
            .assert.elementCount('.todo-list li', 0)
            .click('.todoapp .filters :nth-child(1) a')
            .click('.todo-list :first-child input[type=checkbox]')
            .click('.todoapp .filters :nth-child(3) a')
            .assert.elementCount('.todo-list li', 1);
    },

    ['Counter of active to-dos is correct'](browser) {
        const text = 'e2e-testing';

        add(browser, text);

        add(browser, text + '-2')
            .click('.todo-list :first-child input[type=checkbox]')
            .assert.containsText('.todo-count strong', '1')
            .click('.todoapp .filters :nth-child(2) a')
            .assert.containsText('.todo-count strong', '1')
            .click('.todoapp .filters :nth-child(3) a')
            .assert.containsText('.todo-count strong', '1');
    },

    ['Remove button is not always visible'](browser) {
        add(browser, text)
            .assert.hidden('.clear-completed')
            .click('.todo-list :first-child input[type=checkbox]')
            .assert.visible('.clear-completed');
    },

    ['Remove button is removing all to-dos'](browser) {
        add(browser, text)
            .assert.elementCount('.todo-list li', 1)
            .click('.todo-list :first-child input[type=checkbox]')
            .click('.clear-completed')
            .assert.elementCount('.todo-list li', 0);
    },

    ['Style is well defined'](browser) {
        add(browser, text);
        add(browser, text + '-2');

        browser
            .click('.todo-list :first-child input[type=checkbox]')
            .assert.screenshotIdenticalToBaseline(
                '#todo-box',
                'todo-screen',
                {},
                'VRT complete.'
            );
    },
};
