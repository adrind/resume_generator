Vue.component('resume-field', {
  props: ['data', 'id', 'header', 'list'],
  template: '<div>' +
            '<h3 v-if="header">{{header}}</h3>' +
            '<resume-list v-if="list" :values="list.values"></resume-list>' +
            '<span class="data">{{data}}</span>' +
            '</div>'
});

Vue.component('resume-list', {
    props: ['values', 'header', 'dates'],
    template: '<div class="resume-list">' +
        '<h4 v-if="header">{{header}}</h4>' +
        '<h5 v-if="dates">{{dates}}</h5>' +
        '<ul id="example-1"><li v-for="item in values">{{ item }}</li></ul>' +
        '</div>'
});

Vue.component('skill', {
    props: ['value', 'header', 'isEditing'],
    template: '<div class="skill">' +
              '{{value}}' +
              '<input v-model="value" v-if="isEditing">' +
              '</div>'
});

var createResumeField = function (id, data, message, opts) {
    if(!opts) opts = {};
    return {
        id: id,
        data: data,
        message: message,
        isActive: opts.isActive || false,
        isTextArea: opts.isTextArea || false,
        header: opts.header || '',
        list: opts.list || null,
        label: opts.label || ''
    }
};

var app = new Vue({
    delimiters: ["[", "]"],
    el: '#resume-preview',
    data: {
        resume: [
            createResumeField('name', 'Adrienne Dreyfus', 'What is your name?', {isActive: true}),
            createResumeField('address', '3099 Washington st', 'What is your address?'),
            createResumeField('city', 'San Francisco, CA', 'What is your city?'),
            createResumeField('objective', 'To get better at work', "What's your goal? What do you want to learn on the job?", {isTextArea: true, header: 'Objective'}),
            createResumeField('skills', '', "What skills do you have?", {label: 'Add a skill:', header: 'Skills', list: {values: ['Cooking', 'Cleaning']}})
        ],
        done: false,
        activeIndex: 0,
        newListItem: ''
    },
    methods: {
        nextButtonClicked: function (event) {
            var activeIndex = this.activeIndex,
                newActiveIndex = activeIndex + 1;

            this.resume[activeIndex].isActive = false;

            if(activeIndex === this.resume.length - 1) {
                this.done = true;
            } else {
                this.resume[newActiveIndex].isActive = true;
            }

            this.activeIndex = newActiveIndex;
        },
        backButtonClicked: function (event) {
            var activeIndex = this.activeIndex,
                newActiveIndex = activeIndex - 1;

            this.resume[activeIndex].isActive = false;

            if(activeIndex !== 0) {
                this.resume[activeIndex - 1].isActive = true;
            }

            this.activeIndex = newActiveIndex;
        },
        addToList: function (event) {
            var activeFrame = this.resume[this.activeIndex];

            activeFrame.list.values.push(this.newListItem);
            this.newListItem = ''
        },
        printResume: function (event) {
            var requestData = '';
            this.resume.forEach(function(field){
                if(field.list) {
                    var listData = field.list.values.join(',');
                    requestData = requestData + '&'+ field.id + '=' + listData;
                } else {
                    requestData = requestData + '&'+ field.id + '=' + field.data;
                }
            });

            window.open('/resume/print?'+requestData);
        }
    }
});