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
        '<ul v-if="item.values" id="example-1"><li v-for="data in item.values">{{ data.value }}</li></ul>' +
        '</div>'+
        '</div>'
});

Vue.component('list', {
    props: ['values'],
    data: function () {
        return {
            newItem: '',
            items: []
        }
    },
    template: '<div class="list">' +
    '<ul v-if="values" id="example-1"><li v-for="data in values">{{ data.value }}</li></ul>' +
    '<input v-model="newItem"/><button class="btn btn-base" v-on:click="addToList">Add to list</button>' +
    '</div>',
    methods: {
        addToList: function () {
            this.items.push({value: this.newItem});
            this.newItem = '';
            this.$emit('update:values', this.items);
        }
    }
});

Vue.component('simple-list-item', {
    props: ['value', 'header', 'isEditing'],
    template: '<div class="skill">' +
              '{{value}}' +
              '<input v-model="value" v-if="isEditing">' +
              '</div>'
});

Vue.component('rich-list-item', {
    props: ['value'],
    delimiters: ["[", "]"],
    template: '#rich-list-item',
    data: function () {
        return {
            isEditing: false,
            newListItem: ''
        }
    },
    methods: {
        edit: function (evt) {
            this.isEditing = true;
        },
        save: function (evt) {
            this.isEditing = false;
        },
        add: function (evt) {
            this.value.values.push({value: this.newListItem});
            this.newListItem = '';
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
        previewHeader: opts.header || '',

        serialize: function () {
            return {
                id: this.id,
                type: 'list',
                value: this.list.values
            };
        }
    }
};

var createRichList = function (id, header, opts) {
    if(!opts) opts = {};
    return {
        id: id,
        header: opts.header || '',
        isActive: opts.isActive || false,
        list: opts.list || null,
        listFields: opts.listFields || null,
        label: opts.label || '',
        isRichList: true,
        previewHeader: opts.header || '',

        serialize: function () {
            return {
                id: this.id,
                type: 'rich-list',
                value: this.list.values
            }
        }
    }
};

var createHeaderField = function (id, data, header, opts) {
    if(!opts) opts = {};
    return {
        id: id,
        data: data,
        isActive: opts.isActive || false,
        isField: true,

        serialize: function () {
            return {
                id: this.id,
                type: 'header',
                value: this.data
            };
        }
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
        isField: true,
        
        serialize: function () {
            return {
                id: this.id,
                type: 'field',
                value: this.data
            };
        }
    }
};

var app = new Vue({
    delimiters: ["[", "]"],
    el: '#resume-preview',
    data: {
        resume: [
            createHeaderField('name', 'Adrienne Dreyfus', 'What is your name?', {isActive: true}),
            createHeaderField('address', '3099 Washington st', 'What is your address?'),
            createHeaderField('city', 'San Francisco, CA', 'What is your city?'),
            createResumeField('objective', 'To get better at work', "What's your goal? What do you want to learn during your next job?", {isTextArea: true, header: 'Objective'}),
            createSimpleList('skills', "What skills do you have?", {label: 'Add a skill:', header: 'Skills', list: {values: ['Cooking', 'Cleaning'], isSimpleList: true}}),
            createRichList('education', "What education do you have?", {listFields: [{key: 'header', value: 'School name'}, {key:'dates', value: 'Years attended'}, {key:'values',value:'Things you did', isList: true}],label: 'Add an education:', header: 'Education', list: {values: [{header: 'Tufts', dates:'2009-2013', values:[{value: 'Graduated with degree'}, {value: 'Had fun'}]}]}})
        ],
        done: false,
        activeIndex: 0,
        newListItem: '',
        newRichListItem: {}
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
        addToRichList: function (event) {
            var activeFrame = this.resume[this.activeIndex];
            activeFrame.list.values.push(this.newRichListItem);
            this.newRichListItem = {};
        },
        printResume: function (event) {
            var requestData = [];
            this.resume.forEach(function(field){
                var serializedField = field.serialize();
                requestData.push(serializedField);
            });
            var csrfmiddlewaretoken = $('.container').data('token');

            $.ajaxSetup({
                beforeSend: function(xhr, settings) {
                    if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                        // Only send the token to relative URLs i.e. locally.
                        xhr.setRequestHeader("X-CSRFToken", csrfmiddlewaretoken);
                    }
                }
            });

            $.ajax({
                cache: false,
                url : "/resume/print",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(requestData),
                processData: false,
                success : function(callback){

                },
                error : function(callback){

                }
            });
        }
    }
});