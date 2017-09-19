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
    props: ['field', 'header', 'fieldSet', 'fieldTypes'],
    delimiters: ["[", "]"],
    data: function () {
        return {
            colData: this.field,
            newItem: {},
            showFieldTypes: false
        }
    },
    template: '#double-col',
    mounted: function () {
        var scope = this;
      _.each(this.fieldTypes, function (fieldType) {
        scope.newItem[fieldType.key] = {
            type: fieldType.type,
            data: ''
        }
      });
    },
    methods: {
        editItem: function () {
            this.$emit('update:field', this.colData);
        },
        toggleEdit: function (evt) {
            console.log('evt', evt)
        },
        createNewItem: function () {
            this.showFieldTypes = true;
        },
        addNewItem: function () {
            console.log('new', this.newItem);
            var fields = [];
            _.each(this.newItem, function (val, key) {
                fields.push(createField(val.type, val.data, key));
            });
            this.colData.push(createFieldSet(fields));
            this.showFieldTypes = false;
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

Vue.component('list-item', {
    props: ['value', 'enableEdit', 'hideAdd'],
    delimiters: ["[", "]"],
    data: function () {
      return {
          hasHover: false,
          isEditing: this.enableEdit,
          item: this.value
      }
    },
    template: '#list-item',
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
    template: '#list',
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
                    Vue.set(items, i, newVal);
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
            createSingleCol('Name', 'Bob Jones', 'What is your name?', {isActive: true}),
            createSingleCol('Address', '1234 Alaska st', 'What is your address?'),
            createSingleCol('City', 'Anchorage, AK', 'What is your city?'),
            createSingleCol('Email', 'me@email.com', 'What is your email address?'),
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