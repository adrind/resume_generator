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

Vue.component('single-col', {
    props: ['data', 'header', 'isTextArea'],
    delimiters: ["[", "]"],
    data: function () {
        return {
            colData: this.data
        }
    },
    template: '#single-col',
    methods: {
        editItem: function () {
            this.$emit('update:data', this.colData);
        }
    }
});

Vue.component('double-col', {
    props: ['field', 'header', 'fieldSet'],
    delimiters: ["[", "]"],
    data: function () {
        return {
            colData: this.field
        }
    },
    template: '#double-col',
    methods: {
        editItem: function () {
            this.$emit('update:field', this.colData);
        },
        toggleEdit: function (evt) {
            console.log('evt', evt)
        },
        update: function (oldItem, newItem) {
            console.log('old', oldItem)
        }
    }
});


Vue.component('field-set', {
    props: ['item', 'enableEditing'],
    delimiters: ["[", "]"],
    data: function () {
        return {
            isEditing: this.enableEditing
        }
    },
    template: '#field-set',
    methods: {
        update: function () {
            this.isEditing = false;
            this.$emit('update:enableEditing', this.isEditing);
        },
        toggleEdit: function () {
            this.isEditing = true;
            this.$emit('update:enableEditing', this.isEditing);
        }
    }
});

Vue.component('simple-list-item', {
    props: ['value', 'enableEdit', 'hideAdd'],
    data: function () {
      return {
          hasHover: false,
          isEditing: this.enableEdit,
          item: this.value
      }
    },
    template:   '<li class="item" v-on:hover="onHover">' +
                '<span v-if="!isEditing">{{item}}</span>' +
                '<input v-model="item" v-if="isEditing">' +
                '<button class="btn btn-base-alt float-right" v-if="isEditing" v-on:click="updateItem">Save</button>' +
                '<span class="icons float-right" v-if="!isEditing && !hideAdd">' +
                    '<i class="fa fa-pencil-square-o" aria-hidden="true" v-on:click="editItem" tabindex="0" @keyup.enter="editItem"></i>' +
                    '<i class="fa fa-times" aria-hidden="true" v-on:click="removeItem" tabindex="0" @keyup.enter="removeItem"></i></span>' +
                '</li>',
    methods: {
        onHover: function () {
            this.hasHover.toggle()
        },
        removeItem: function () {
            this.$emit('remove', this.item);
        },
        editItem: function () {
            this.isEditing = true;
        },
        updateItem: function () {
            this.isEditing = false;
            this.$emit('update:value', this.item);
            this.$emit('update', this.value, this.item);
        }
    }
});

Vue.component('list', {
    props: ['values', 'id', 'enableEdit', 'hideAdd'],
    data: function () {
        return {
            newItem: '',
            items: this.values || [],
            isEditing: this.enableEdit
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
    '<ul><simple-list-item :value.sync="data" v-for="(data, i) in items" :enable-edit="isEditing" :hide-add="hideAdd" :key="i" v-on:remove="removeFromList" v-on:update="updateList"></simple-list-item><li v-if="!hideAdd"><input v-model="newItem" @keyup.enter="addToList" class="newItemInput"/>' +
    '<button class="btn btn-base-alt float-right" v-on:click="addToList" v-if="!hideAdd">Add</button>' +
    '</li></ul>' +
    '</div>',
    methods: {
        addToList: function () {
            if(this.newItem) {
                this.items.push(this.newItem);
                this.newItem = '';
                this.$emit('update:values', this.items);
            }
        },
        updateList: function (oldVal, newVal) {
            this.items = _.each(this.items, function (item, i, items) {
                if(item === oldVal) {
                    items[i] = newVal
                }
            });
            this.$emit('update:values', this.items);
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

var createSingleCol = function (id, data, header, opts) {
    if(!opts) opts = {};
    return {
        id: id,
        data: data,
        isActive: opts.isActive || false,
        isSingleCol: true,
        header: header,

        serialize: function () {
            return {
                id: this.id,
                type: 'single-col',
                data: this.data
            };
        }
    }
};


var createDoubleCol = function (id, data, header, opts) {
    if(!opts) opts = {};
    return {
        id: id,
        data: data,
        header: header,
        isActive: opts.isActive || false,
        isTextArea: opts.isTextArea || false,
        previewHeader: opts.header || '',
        isDoubleCol: true,
        fieldTypes: opts.fieldTypes,

        serialize: function () {
            return {
                id: this.id,
                type: 'double-col',
                data: {
                    header: this.previewHeader,
                    values: _.flatten(_.map(this.data, function (item) {
                       return item.serialize()
                    }))
                }
            };
        }
    }
};

var createField = function (type, data, id, label) {
    return {
        type: type,
        id: id,
        isTextArea: type === 'paragraph',
        isList: type === 'list',
        isField: type === 'field',
        data: data,
        label: label || '',
        isEditing: false,

        serialize: function () {
            return {
                type: this.type,
                data: this.data
            }
        }
    }
};

var createFieldSet = function (fields) {
    return {
        fields: fields,
        isFieldSet: true,
        isEditing: false,
        
        serialize: function () {
            return _.map(this.fields, function (field) {
                return field.serialize()
            });
        }
    }
};

var app = new Vue({
    delimiters: ["[", "]"],
    el: '#resume-preview',
    data: {
        resume: [
            createSingleCol('Name', 'Adrienne Dreyfus', 'What is your name?', {isActive: true}),
            createSingleCol('Address', '3099 Washington st', 'What is your address?'),
            createSingleCol('City', 'San Francisco, CA', 'What is your city?'),
            createSingleCol('Email', 'adrienne@codeforamerica.org', 'What is your email address?'),
            createDoubleCol('Objective', [createField('paragraph', 'Test')], "What's your goal? What do you want to learn during your next job?", {isTextArea: true, header: 'Objective'}),
            createDoubleCol('Skills', [createField('list', ['cooking', 'cleaning'])] ,"What skills do you have?", {label: 'Add a skill:', header: 'Skills', list: {values: [{value:'cooking'}, {value:'coding'}], isSimpleList: true}}),
            createDoubleCol('Education', [createFieldSet([createField('field', 'School Name'), createField('field', 'Dates attended'), createField('list', ['Learned']) ])], "What education do you have?", {fieldTypes: [{key: 'header', label: 'School name', type: 'field'}, {key:'dates', label: 'Years attended', type: 'field'}, {key:'values',label:'Things you did', type: 'list'}],label: 'Add an education:', header: 'Education'}),
            createDoubleCol('Work', [createFieldSet([createField('field', 'Work name'), createField('field', 'Dates worked'), createField('list', ['Learned']) ])], "What work have you done?", {fieldTypes: [{key: 'header', label: 'Work name', type: 'field'}, {key:'dates', label: 'Years worked', type: 'field'}, {key:'values',label:'Things you did', type: 'list'}],label: 'Add an work:', header: 'Work'})
        ],
        activeIndex: 0,
        newListItem: '',
        newRichListItem: {},
        isAddingNewItem: false
    },
    methods: {
        nextButtonClicked: function (event) {
            var index = $(event.target).data('id');
            var activeIndex = this.activeIndex,
                newActiveIndex = index === undefined ? activeIndex + 1 : index;

            this.resume[activeIndex].isActive = false;
            this.resume[newActiveIndex].isActive = true;

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