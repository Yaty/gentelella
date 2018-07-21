const STORAGE_KEY = 'todos';

const todoStorage = {
    fetch() {
        const todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        todos.forEach(function (todo, index) {
            todo.id = index;
        });
        todoStorage.uid = todos.length;
        return todos;
    },
    save(todos) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    },
};

const ACCOUNT_ID_KEY = 'ACCOUNT_ID';
const ACCOUNT_TOKEN_KEY = 'ACCOUNT_TOKEN';

const userStorage = {
    getAccountId() {
        return localStorage.getItem(ACCOUNT_ID_KEY);
    },
    getToken() {
        return localStorage.getItem(ACCOUNT_TOKEN_KEY);
    },
};

// visibility filters
const filters = {
    all(todos) {
        return todos;
    },
    active(todos) {
        return todos.filter(function (todo) {
            return !todo.completed;
        });
    },
    completed(todos) {
        return todos.filter(function (todo) {
            return todo.completed;
        });
    },
};

const BASE_URL = 'http://localhost:3000/api';

function init_chart_doughnut(contributions = []){
    if (typeof Chart === 'undefined') return;
    const canvas = document.querySelector(".canvasDoughnut");
    if (!canvas) return;

    const chart_doughnut_settings = {
        type: 'doughnut',
        tooltipFillColor: "rgba(51, 51, 51, 0.55)",
        data: {
            labels: contributions.map((c) => c.firstname + " " + c.lastname),
            datasets: [{
                data: contributions.map((c) => c.percentage),
                backgroundColor: contributions.map((c) => c.backgroundColor),
                hoverBackgroundColor: contributions.map((c) => c.hoverBackgroundColor),
            }]
        },
        options: {
            legend: false,
            responsive: false
        }
    };
    new Chart(canvas, chart_doughnut_settings);
}

let gauge;

function init_gauge(percentage) {
    if (typeof Gauge === 'undefined') return;
    if (typeof percentage !== 'number') return;

    if (gauge) {
        gauge.set(percentage);
        return;
    }

    const gaugeEl = document.getElementById("chart_gauge_01");

    const chart_gauge_settings = {
        lines: 12,
        angle: 0,
        lineWidth: 0.4,
        pointer: {
            length: 0.75,
            strokeWidth: 0.042,
            color: '#1D212A'
        },
        limitMax: 'false',
        colorStart: '#1ABC9C',
        colorStop: '#1ABC9C',
        strokeColor: '#F0F3F3',
        generateGradient: true
    };


    gauge = new Gauge(gaugeEl).setOptions(chart_gauge_settings);

    gauge.maxValue = 100;
    gauge.animationSpeed = 32;
    gauge.set(percentage);
    gauge.setTextField(document.getElementById("gauge-text"));
}

function getPlotArray(dates) {
    const oneDay = 24 * 60 * 60 * 1000;
    const minDate = new Date(Math.min.apply(null, dates));
    const maxDate = new Date(Math.max.apply(null, dates));

    const getDayDiff = (date1, data2) => Math.round(Math.abs((date1.getTime() - data2.getTime())/(oneDay)));

    const diff = getDayDiff(minDate, maxDate);

    // Create an element for each date
    const array = Array.from({length: diff + 1}, (current, i) => {
        const date = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
        date.setHours(-22);
        date.setDate(minDate.getDate() + i);

        return [
            date.getTime(),
            0,
        ];
    });

    // Add occurrences
    for (const date of dates) {
        array[getDayDiff(minDate, date)][1]++;
    }

    return array;
}

function initPlotChart(dates, chart) {
    if( typeof ($.plot) === 'undefined'){ return; }

    const times = getPlotArray(dates);

    const plotSettings = {
        series: {
            lines: {
                show: false,
                fill: true
            },
            splines: {
                show: true,
                tension: 0.1,
                lineWidth: 1,
                fill: 0.4
            },
            points: {
                radius: 5,
                show: true
            },
            shadowSize: 3
        },
        grid: {
            verticalLines: true,
            hoverable: true,
            clickable: true,
            tickColor: "#d5d5d5",
            borderWidth: 1,
            color: '#fff'
        },
        colors: ["rgba(38, 185, 154, 0.38)", "rgba(3, 88, 106, 0.38)"],
        xaxis: {
            // tickColor: "rgba(51, 51, 51, 0.06)",
            mode: "time",
            tickSize: [1, "day"],
            // tickLength: 10,
            axisLabel: "Date",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 10
        },
        yaxis: {
            ticks: 5,
            tickColor: "rgba(51, 51, 51, 0.06)",
        },
        tooltip: false
    };


    $.plot(document.getElementById(chart), [times], plotSettings);
}


const app = new Vue({
    el: '#app',
    data() {
        return {
            firstname: null,
            lastname: null,
            avatar: 'http://localhost:63342/admin/production/images/img.jpg',
            projects: [],
            conversations: [],
            selectedProjectId: null,
            workers: [],
            bugs: [],
            meetings: [],
            steps: [],
            tasks: [],
            todos: todoStorage.fetch(),
            newTodo: '',
            editedTodo: null,
            visibility: 'all',
            accountId: userStorage.getAccountId(),
            token: userStorage.getToken(),
            showConversationModal: false,
            showUpdateProjectModal: false,
            showAddCollaboratorModal: false,
            showAddStepModal: false,
            openedConversation: null,
            newMessage: '',
            newCollaborator: '',
            newStepName: '',
            newStepDate: null,
        };
    },
    created() {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.token;
    },
    async mounted() {
        await this.getProjects();
        this.selectedProjectId = this.projects.length > 0 ? this.projects[0].id : null;
        await this.loadProject();
        await this.loadConversations();
        // setInterval(async () => await this.loadConversations(), 10000);

    },
    // watch todos change for localStorage persistence
    watch: {
        todos: {
            handler (todos) {
                todoStorage.save(todos)
            },
            deep: true
        },
        contributions(c) {
            init_chart_doughnut(c);
        },
        percentageTasksDone(completion) {
            init_gauge(completion);
        },
        bugs(bugs) {
            initPlotChart(bugs.map((b) => new Date(b.created)), "plot_bugs");
        },
        meetings(meetings) {
            initPlotChart(meetings.map((b) => new Date(b.date)), "plot_meetings");
        },
        steps(steps) {
            initPlotChart(steps.map((b) => new Date(b.date)), "plot_steps");
        }
    },
    filters: {
        pluralize (n) {
            return n === 1 ? 'item' : 'items'
        }
    },
    directives: {
        'todo-focus' (el, binding) {
            if (binding.value) {
                el.focus()
            }
        }
    },
    methods: {
        async addStep() {
            await axios.post(
                BASE_URL + '/accounts/' + this.accountId +
                '/projects/' + this.selectedProjectId + '/steps',
                {
                    name: this.newStepName,
                    date: new Date(this.newStepDate).toISOString(),
                    projectId: this.selectedProjectId,
                    state: true,
                }
            );

            this.newStepDate = null;
            this.newStepName = '';
            await this.loadProject();
        },
        async addCollaborator() {
            await axios.put(
                BASE_URL + '/accounts/'  +this.accountId +
                '/projects/' + this.selectedProjectId +
                '/accounts/rel/' + this.newCollaborator
            );

            this.newCollaborator = '';
            await this.loadProject();
        },
        async updateProject() {
          await axios.patch(
              BASE_URL + '/projects/' + this.selectedProject.id,
              this.selectedProject,
          );
        },
        async sendMessage() {
            await axios.post(
                BASE_URL + '/conversations/' + this.openedConversation.id + '/messages',
                {
                    content: this.newMessage,
                    accountId: this.accountId,
                },
            );

            this.newMessage = '';
            await this.loadConversations();
            this.openedConversation = this.conversations.find((c) => c.id === this.openedConversation.id);
        },
        getMessageOwnerName(message, conversation) {
            const account = conversation.accounts.find((a) => a.id === message.accountId);
            return account.firstname + ' ' + account.lastname;
        },
        openConversation(conversation) {
            this.openedConversation = conversation;
            this.showConversationModal = true;
        },
        getLastMessage(conversation) {
            const message = conversation.messages[conversation.messages.length - 1];
            const account = conversation.accounts.find((a) => a.id === message.accountId);

            return {
                firstname: account.firstname,
                lastname: account.lastname,
                content: message.content,
            };
        },
        async logout() {
          await axios.post(
              BASE_URL + '/accounts/logout'
          );

          delete axios.defaults.headers.common['Authorization'];
          window.location.href = '../index.html';
        },
        async loadConversations() {
            const res = await axios.get(
                BASE_URL + '/accounts/' + this.accountId
                + '/conversations?filter={"include":["accounts", "messages"]}'
            );

            this.conversations = res.data;
        },
        generateHex() {
            return "#" + Math.random().toString(16).slice(2, 8);
        },
        async loadProject() {
            const res = await axios.get(
                BASE_URL + '/projects/' + this.selectedProjectId +
                '?filter={"include":["accounts", "bugs", "steps", "tasks", "meetings"]}'
            );

            this.workers = res.data.accounts;
            this.bugs = res.data.bugs;
            this.steps = res.data.steps;
            this.tasks = res.data.tasks;
            this.meetings = res.data.meetings;
        },
        async getProjects() {
            const res = await axios.get(BASE_URL + '/accounts/me/projects');
            this.projects = res.data;
        },
        cleanTodo() {
            this.todos = [];
        },
        addTodo () {
            const value = this.newTodo && this.newTodo.trim()
            if (!value) {
                return
            }
            this.todos.push({
                id: todoStorage.uid++,
                title: value,
                completed: false
            })
            this.newTodo = ''
        },

        removeTodo (todo) {
            this.todos.splice(this.todos.indexOf(todo), 1)
        },

        editTodo (todo) {
            this.beforeEditCache = todo.title
            this.editedTodo = todo
        },

        doneEdit (todo) {
            if (!this.editedTodo) {
                return
            }
            this.editedTodo = null
            todo.title = todo.title.trim()
            if (!todo.title) {
                this.removeTodo(todo)
            }
        },

        cancelEdit (todo) {
            this.editedTodo = null
            todo.title = this.beforeEditCache
        },

        removeCompleted () {
            this.todos = filters.active(this.todos)
        }
    },
    computed: {
        contributions() {
            const workers = this.workers.map((w) => ({
                workerId: w.id,
                firstname: w.firstname,
                lastname: w.lastname,
            }));

            for (const bug of this.bugs) {
                if (bug.state === true) {
                    const contributor = workers.find((c) => c.workerId === bug.closerId);

                    if (contributor) {
                        if (typeof contributor.closedBugs === 'undefined') {
                            contributor.closedBugs = 1;
                        } else {
                            contributor.closedBugs++;
                        }
                    }
                }
            }

            const contributors = [];

            for (const contributor of workers) {
                if (typeof contributor.closedBugs === 'number') {
                    contributor.percentage = (contributor.closedBugs / this.closedBugsCount) * 100;
                    contributor.backgroundColor = this.generateHex();
                    contributor.hoverBackgroundColor = this.generateHex();
                    contributors.push(contributor);
                }
            }

            return contributors;
        },
        selectedProject() {
          return this.projects.find((p) => p.id === this.selectedProjectId);
        },
        filteredTodos () {
            return filters[this.visibility](this.todos)
        },
        remaining () {
            return filters.active(this.todos).length
        },
        allDone: {
            get () {
                return this.remaining === 0
            },
            set (value) {
                this.todos.forEach(function (todo) {
                    todo.completed = value
                })
            }
        },
        workersCount() {
            return this.workers.length;
        },
        openedBugsCount() {
            return this.bugs.filter(function(bug) {
                return bug.state === false;
            }).length;
        },
        closedBugsCount() {
            return this.bugs.filter(function(bug) {
                return bug.state === true;
            }).length;
        },
        incomingMeetingsCount() {
            const now = Date.now();
            return this.meetings.filter(function(meeting) {
                return new Date(meeting.date) > now;
            }).length;
        },
        stepsToAchieveCount() {
            return this.steps.filter(function(step) {
                return step.state === true;
            }).length;
        },
        stepsAchievedCount() {
            return this.steps.filter(function(step) {
                return step.state === false;
            }).length;
        },
        tasksToAchieveCount() {
            return this.tasks.filter(function(task) {
                return task.state === false;
            }).length;
        },
        tasksAchievedCount() {
            return this.tasks.filter(function(task) {
                return task.state === true;
            }).length;
        },
        percentageBugsResolved() {
            return Math.floor((this.closedBugsCount / this.bugs.length) * 100) || 0;
        },
        percentageTasksDone() {
            return Math.floor((this.tasksAchievedCount / this.tasks.length) * 100) || 0;
        },
        percentageMeetingsDone() {
            return Math.floor(((this.meetings.length - this.incomingMeetingsCount) / this.meetings.length) * 100) || 0;
        },
        percentageStepsDone() {
            return Math.floor((this.stepsAchievedCount / this.steps.length) * 100) || 0;
        }
    }
});

// handle routing
function onHashChange () {
    const visibility = window.location.hash.replace(/#\/?/, '')
    if (filters[visibility]) {
        app.visibility = visibility
    } else {
        window.location.hash = ''
        app.visibility = 'all'
    }
}

window.addEventListener('hashchange', onHashChange)
onHashChange()
