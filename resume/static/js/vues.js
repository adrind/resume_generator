Vue.component('preview-field', {
    props: ['item', 'header'],
    delimiters: ["[", "]"],
    template: '#preview-item'
});

Vue.component('simple-list-preview', {
    props: ['list'],
    template: '<div class="resume-list">' +
        '<ul id="example-1"><li v-for="data in list">{{ data }}</li></ul>' +
        '</div>'
});

Vue.component('rich-list-preview', {
    props: ['list'],
    template: '<div class="resume-list">' +
        '<div v-for="item in list" class="rich-list-preview">' +
        '<h4 v-if="item.header">{{item.header}}</h4>' +
        '<h5 v-if="item.dates">{{item.dates}}</h5>' +
        '<ul v-if="item.values" id="example-1"><li v-for="data in item.values">{{ data }}</li></ul>' +
        '</div>'+
        '</div>'
});

Vue.component('simple-list-item', {
    props: ['value', 'header', 'isEditing'],
    template: '<div class="skill">' +
              '{{value}}' +
              '<input v-model="value" v-if="isEditing">' +
              '</div>'
});

Vue.component('rich-list-item', {
    props: ['value', 'isEditing'],
    delimiters: ["[", "]"],
    template: '#rich-list-item',
    methods: {
        edit: function () {

        }
    }
});

var createSimpleList = function (id, header, opts) {
    if(!opts) opts = {};
    return {
        id: id,
        header: opts.header || '',
        isActive: opts.isActive || false,
        list: opts.list || null,
        label: opts.label || '',
        isSimpleList: true,
        previewHeader: opts.header || ''
    }
};

var createRichList = function (id, header, opts) {
    if(!opts) opts = {};
    return {
        id: id,
        header: opts.header || '',
        isActive: opts.isActive || false,
        list: opts.list || null,
        label: opts.label || '',
        isRichList: true,
        previewHeader: opts.header || ''
    }
};

var createResumeField = function (id, data, header, opts) {
    if(!opts) opts = {};
    return {
        id: id,
        data: data,
        header: header,
        isActive: opts.isActive || false,
        isTextArea: opts.isTextArea || false,
        previewHeader: opts.header || '',
        isField: true
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
            createResumeField('objective', 'To get better at work', "What's your goal? What do you want to learn during your next job?", {isTextArea: true, header: 'Objective'}),
            createSimpleList('skills', "What skills do you have?", {label: 'Add a skill:', header: 'Skills', list: {values: ['Cooking', 'Cleaning'], isSimpleList: true}}),
            createRichList('education', "What education do you have?", {label: 'Add an education:', header: 'Education', list: {values: [{header: 'Tufts', dates:'2009-2013', values:['Graduated with degree', 'Had fun']}]}})
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