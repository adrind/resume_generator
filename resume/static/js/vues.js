var skillsBloodhound = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        url: 'http://api.dataatwork.org/v1/skills/autocomplete?begins_with=%QUERY',
        wildcard: '%QUERY'
    }
});


Vue.component('preview-field', {
    props: ['item', 'header'],
    delimiters: ["[", "]"],
    template: '#preview-item'
});

Vue.component('simple-list-preview', {
    props: ['list'],
    template: '<div class="resume-list">' +
        '<ul id="example-1"><li v-for="data in list">{{ data.value }}</li></ul>' +
        '</div>'
});

Vue.component('rich-list-preview', {
    props: ['list'],
    template: '<div class="resume-list">' +
        '<div v-for="item in list" class="rich-list-preview">' +
        '<h4 class="preview-rich-list-header" v-if="item.header">{{item.header}}</h4>' +
        '<h5 class="preview-rich-list-header" v-if="item.dates">{{item.dates}}</h5>' +
        '<ul v-if="item.values" id="example-1"><li v-for="data in item.values">{{ data.value }}</li></ul>' +
        '</div>'+
        '</div>'
});

Vue.component('simple-list-item', {
    props: ['value', 'isEditing'],
    data: function () {
      return {
          hasHover: false
      }
    },
    template:   '<li class="item" v-on:hover="onHover">' +
                '{{value}}' +
                '<input v-model="value" v-if="isEditing">' +
                '<span class="icons float-right">' +
                    '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>' +
                    '<i class="fa fa-times" aria-hidden="true" v-on:click="removeItem"></i></span>' +
                '</li>',
    methods: {
        onHover: function () {
            this.hasHover.toggle()
        },
        removeItem: function () {
            this.$emit('remove', this.value);
        }
    }
});

Vue.component('list', {
    props: ['values', 'id'],
    data: function () {
        return {
            newItem: '',
            items: this.values || []
        }
    },
    mounted: function () {
        var scope = this;
        if(this.id === 'Skills') {
            $('.'+this.id+ ' .newItemInput').typeahead(null, {
                name: 'new-skill',
                display: 'normalized_skill_name',
                source: skillsBloodhound
            }).bind('typeahead:select', function (ev, suggestion) {
                var result = suggestion.normalized_skill_name;
                scope.newItem = result;
            });
        }
    },
    template: '<div class="list">' +
    '<ul><simple-list-item :value="data.value" :isEditing="false" v-for="data in items" v-on:remove="removeFromList"></simple-list-item><li><input v-model="newItem" @keyup.enter="addToList" class="newItemInput"/>' +
    '<button class="btn btn-base-alt float-right" v-on:click="addToList">Add</button>' +
    '</li></ul>' +
    '</div>',
    methods: {
        addToList: function () {
            if(this.newItem) {
                this.items.push({value: this.newItem});
                this.newItem = '';
                this.$emit('update:values', this.items);
            }
        },
        removeFromList: function (value) {
            if(value) {
                this.items = _.reject(this.items, function (item) {
                    return value === item.value;
                });
                this.$emit('update:values', this.items);
            }
        }
    }
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
        header: header,

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
            createHeaderField('email', 'adrienne@codeforamerica.org', 'What is your email address?'),
            createResumeField('Objective', 'To get better at work', "What's your goal? What do you want to learn during your next job?", {isTextArea: true, header: 'Objective'}),
            createSimpleList('Skills', "What skills do you have?", {label: 'Add a skill:', header: 'Skills', list: {values: [{value:'cooking'}, {value:'coding'}], isSimpleList: true}}),
            createRichList('Education', "What education do you have?", {listFields: [{key: 'header', value: 'School name'}, {key:'dates', value: 'Years attended'}, {key:'values',value:'Things you did', isList: true}],label: 'Add an education:', header: 'Education', list: {values: [{header: 'Tufts', dates:'2009-2013', values:[{value: 'Graduated with degree'}, {value: 'Had fun'}]}]}}),
            createRichList('Professional Experience', "What work experience do you have?", {listFields: [{key: 'header', value: 'Title, Place of Work'}, {key:'dates', value: 'Years worked there'}, {key:'values',value:'Things you did', isList: true}],label: 'Add work experience:', header: 'Professional Experience', list: {values: [{header: 'Code for America', dates:'Feb 01 2017 - Oct 27 2017', values:[{value: 'Wrote some code'}, {value: 'Had fun'}]}]}})
        ],
        done: false,
        activeIndex: 0,
        newListItem: '',
        newRichListItem: {},
        isAddingNewItem: false
    },
    methods: {
        nextButtonClicked: function (event) {
            var activeIndex = this.activeIndex,
                newActiveIndex = activeIndex + 1;

            this.resume[activeIndex].isActive = false;
            this.resume[newActiveIndex].isActive = true;

            if(newActiveIndex === this.resume.length - 1) {
                this.done = true;
            }

            this.activeIndex = newActiveIndex;
            this.isAddingNewItem = false;
        },
        backButtonClicked: function (event) {
            var activeIndex = this.activeIndex,
                newActiveIndex = activeIndex - 1;

            this.resume[activeIndex].isActive = false;

            if(activeIndex !== 0) {
                this.resume[activeIndex - 1].isActive = true;
            }

            this.done = false;
            this.activeIndex = newActiveIndex;
            this.isAddingNewItem = false;
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
            this.isAddingNewItem = false;
        },
        addNewItem: function (event) {
          this.isAddingNewItem = true;
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
                success : function(response){
                    window.location = '/resume/download?file='+response.fileName;
                },
                error : function(callback){

                }
            });
        }
    }
});