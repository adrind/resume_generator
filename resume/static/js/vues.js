var skillsBloodhound = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        url: 'http://api.dataatwork.org/v1/skills/autocomplete?begins_with=%QUERY',
        wildcard: '%QUERY'
    }
});

var jobsBloodhound = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        url: 'http://api.dataatwork.org/v1/jobs/autocomplete?begins_with=%QUERY',
        wildcard: '%QUERY'
    }
});

Vue.component('template1', {
    props: ['resume'],
    delimiters: ["[", "]"],
    template: '#template-1'
});

Vue.component('template2', {
    props: ['resume'],
    delimiters: ["[", "]"],
    template: '#template-2'
});

Vue.component('template3', {
    props: ['resume'],
    delimiters: ["[", "]"],
    template: '#template-3'
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
    props: ['field', 'header', 'fieldTypes'],
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
        editTriggered: function () {
            var fieldsWithAutocomplete = _.filter(this.colData.fields, function (field) {
                return field.hasAutocomplete === 'jobs';
            });
            if(fieldsWithAutocomplete && fieldsWithAutocomplete.length) {
                $('.newItemInput.title').typeahead(null, {
                    name: 'new-job',
                    display: 'normalized_job_title',
                    source: jobsBloodhound
                }).bind('typeahead:select', function (ev, suggestion) {
                    var result = suggestion.normalized_job_title;
                    scope.newItem = result;
                });
            }
        },
        editItem: function () {
            this.$emit('update:field', this.colData);
        },
        createNewItem: function () {
            this.showFieldTypes = true;
            this.emit('editTriggered');
        },
        addNewItem: function () {
            var fields = [];
            var scope = this;

            _.each(this.newItem, function (val, key) {
                fields.push(createField(key, val.type, val.data, key));
            });
            this.colData.push(createFieldSet(fields));
            this.showFieldTypes = false;
              _.each(this.fieldTypes, function (fieldType) {
                scope.newItem[fieldType.key] = {
                    type: fieldType.type,
                    data: ''
                }
              });
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
    props: ['values', 'id', 'enableEdit', 'hideAdd', 'hasAutocomplete'],
    data: function () {
        return {
            newItem: '',
            items: this.values || [],
            isEditing: this.enableEdit
        }
    },
    mounted: function () {
        var scope = this;
        if(this.hasAutocomplete) {
            if(this.hasAutocomplete === 'skills') {
                $('.newItemInput').typeahead(null, {
                    name: 'new-skill',
                    display: 'normalized_skill_name',
                    source: skillsBloodhound
                }).bind('typeahead:select', function (ev, suggestion) {
                    var result = suggestion.normalized_skill_name;
                    scope.newItem = result;
                });
            }
            if(this.hasAutocomplete === 'jobs') {
                $('.newItemInput.title').typeahead(null, {
                    name: 'new-job',
                    display: 'normalized_job_title',
                    source: jobsBloodhound
                }).bind('typeahead:select', function (ev, suggestion) {
                    var result = suggestion.normalized_job_title;
                    scope.newItem = result;
                });
            }
        }
    },
    template: '#list',
    methods: {
        addToList: function () {
            if(this.newItem) {
                this.items.push(this.newItem);
                if(typeof ga !== 'undefined') {
                    ga('send', 'event', 'list', 'added', this.newItem, this.items.toString())
                }
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
                    return value === item;
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
        previewHeader: opts.previewHeader || '',
        isDoubleCol: true,
        fieldTypes: opts.fieldTypes,

        serialize: function () {
            return {
                id: this.id,
                type: 'double-col',
                data: {
                    header: this.previewHeader,
                    values: _.map(this.data, function (item) {
                       return item.serialize()
                    })
                }
            };
        }
    }
};

var createField = function (id, type, data, opts) {
    if(!opts) {opts = {}}
    return {
        type: type,
        isTextArea: type === 'paragraph',
        isList: type === 'list',
        isField: type === 'field',
        data: data,
        isEditing: false,
        hasAutocomplete: opts.hasAutocomplete,
        style: opts.style || '',
        id: id,

        serialize: function () {
            return {
                type: this.type,
                data: this.data,
                style: this.style,
                id: this.id
            }
        }
    }
};

var createFieldSet = function (fields) {
    var fieldSet = {};
    _.each(fields, function (field) {
        fieldSet[field.id] = field;
    });

    return {
        fields: fieldSet,
        isFieldSet: true,
        isEditing: false,
        
        serialize: function () {
            var data = {};
            _.each(this.fields, function (field) {
               data[field.id] = field
            });
            return data;
        }
    }
};

var createSpacer = function (px) {
    return {
        type: 'spacer',
        data: px || 20,

        serialize: function () {
            return {
                type: this.type,
                data: this.data
            }
        }
    }
};

var app = new Vue({
    delimiters: ["[", "]"],
    el: '#resume-preview',
    data: {
        resume: {
            name: createSingleCol('Name', 'Bob Jones', 'What is your name?', {isActive: true}),
            address: createSingleCol('Address', '1234 Alaska st', 'What is your address?'),
            city: createSingleCol('City', 'Anchorage, AK', 'What is your city?'),
            email: createSingleCol('Email', 'me@email.com', 'What is your email address?'),
            objective: createDoubleCol('Objective', [createField('objective','paragraph', 'I want to save the world!')], "What's your goal? What do you want to learn during your next job?", {previewHeader: 'Objective'}),
            skills: createDoubleCol('Skills', [createField('skills','list', ['cooking', 'eating'], {hasAutocomplete:'skills'})], "What skills do you have?", {previewHeader: 'Skills and Abilities'}),
            education: createDoubleCol('Education', [createFieldSet([createField('name','field', 'School Name', {style: 'bold'}), createField('dates','field', 'August 2001 - May 2005'), createField('description','list', ['Graduated Summa Cum Laude']) ])], "What education do you have?", {fieldTypes: [{key: 'name', label: 'School name', type: 'field'}, {key:'dates', label: 'Years attended', type: 'field'}, {key:'description',label:'Things you did', type: 'list'}],label: 'Add an education:', previewHeader: 'Education and Certificates'}),
            work: createDoubleCol('Work', [createFieldSet([createField('name','field', 'Work name', {style: 'bold'}), createField('title', 'field', 'Name of Position', {hasAutocomplete: 'jobs'}), createField('dates','field', 'Dates worked'), createField('description','list', ['Learned']) ])], "What work have you done?", {fieldTypes: [{key: 'name', label: 'Work name', type: 'field'}, {key: 'title', label: 'Title at company', type: 'field'}, {key:'dates', label: 'Years worked', type: 'field'}, {key:'description',label:'Things you did', type: 'list'}],label: 'Add an work:', previewHeader: 'Work and Experience'})

        },
        activeIndex: 0,
        newListItem: '',
        newRichListItem: {},
        isAddingNewItem: false,
        templateSelected: 1
    },
    methods: {
        nextButtonClicked: function (event) {
            var resumeFields = _.keys(this.resume);
            var index = $(event.target).data('id');

            var activeIndex = this.activeIndex,
                newActiveIndex = index === undefined ? activeIndex + 1 : index;

            this.resume[resumeFields[activeIndex]].isActive = false;
            this.resume[resumeFields[newActiveIndex]].isActive = true;

            this.activeIndex = newActiveIndex;
            this.isAddingNewItem = false;
        },
        backButtonClicked: function (event) {
            var resumeFields = _.keys(this.resume);
            var activeIndex = this.activeIndex,
                newActiveIndex = activeIndex - 1;

            this.resume[resumeFields[activeIndex]].isActive = false;

            if(activeIndex !== 0) {
                this.resume[resumeFields[activeIndex - 1]].isActive = true;
            }

            this.activeIndex = newActiveIndex;
            this.isAddingNewItem = false;
        },
        addToList: function (event) {
            var resumeFields = _.keys(this.resume);
            var activeFrame = this.resume[resumeFields[this.activeIndex]];

            activeFrame.list.values.push(this.newListItem);
            this.newListItem = ''
        },
        addNewItem: function (event) {
          this.isAddingNewItem = true;
        },
        printResume: function (event) {
            var requestData = {
                data: [],
                template: this.templateSelected
            };
            _.each(this.resume, function (field, key) {
                var serializedField = field.serialize();
                requestData.data.push(serializedField);
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