const rewire = require('rewire');
const sinon = require('sinon');
const {expect} = require('chai');

const storage = {
    getItem() {},
    setItem() {},
};

const window = {
    addEventListener() {},
    location: {
        hash: {
            replace() {},
        }
    }
};

global.Vue = require('vue');
global.localStorage = storage;
global.window = window;
global.axios = require('axios');

const main = rewire('../../build/js/main');
const app = main.__get__('app');

function createTodo() {
    app.newTodo = 'new todo !';
    app.addTodo();
    return app.todos[app.todos.length - 1];
}

const spyAdd = sinon.spy(app, 'addTodo');
const spyUpdate = sinon.spy(app, 'doneEdit');
const spyDelete = sinon.spy(app, 'removeTodo');

describe('TODO List', () => {
    beforeEach(() => {
        app.cleanTodo();
        spyAdd.resetHistory();
        spyUpdate.resetHistory();
        spyDelete.resetHistory();
    });

    it('should add', () => {
        app.newTodo = 'new todo !';
        app.addTodo();
        expect(app.newTodo).to.equal('');
        expect(app.todos).to.satisfy((todos) => {
            for (const todo of todos) {
                if (todo.title === 'new todo !') {
                    return true;
                }
            }

            return false;
        });

        expect(spyAdd.calledOnce).to.be.true;
    });

    it('should not add for empty todo', () => {
        app.newTodo = '';
        app.addTodo();
        expect(app.newTodo).to.equal('');
        expect(app.todos).to.satisfy((todos) => {
            for (const todo of todos) {
                if (todo.title === 'new todo !') {
                    return false;
                }
            }

            return true;
        });

        expect(spyAdd.calledOnce).to.be.true;
    });

    it('should update', () => {
        const todo = createTodo();
        app.editTodo(todo);
        app.editedTodo.title = 'edited todo !';
        app.doneEdit(todo);

        expect(app.todos[0].title).to.equal('edited todo !');
        expect(spyUpdate.calledOnce).to.be.true;
    });

    it('should cancel update', () => {
        const todo = createTodo();
        app.editTodo(todo);
        app.editedTodo.title = 'edited todo !';
        app.cancelEdit(todo);

        expect(app.todos[0].title).to.equal('new todo !');
        expect(spyUpdate.notCalled).to.be.true;
    });

    it('should remove', () => {
        const todo = createTodo();
        app.removeTodo(todo);
        expect(app.todos.length).to.equal(0);
        expect(spyDelete.calledOnce).to.be.true;
    });

    it('should remove all', () => {
        createTodo();
        app.cleanTodo();
        expect(app.todos.length).to.equal(0);
    });
});