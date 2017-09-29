var skillsBloodhound = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        url: 'https://api.dataatwork.org/v1/skills/autocomplete?begins_with=%QUERY',
        wildcard: '%QUERY'
    }
});

var jobsBloodhound = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        url: 'https://api.dataatwork.org/v1/jobs/autocomplete?begins_with=%QUERY',
        wildcard: '%QUERY'
    }
});

var csrfTokenSetup = function () {
    var csrfmiddlewaretoken = $('.container').data('token');

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", csrfmiddlewaretoken);
            }
        }
    });
};

Vue.directive('focus', {
  update: function (el) {
    el.focus()
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

Vue.component('field-input', {
    props: ['data', 'placeholder', 'id', 'isTextArea'],
    data: function () {
      return {
          inputData: this.placeholder === this.data ? '' : this.data
      }
    },
    template: '<textarea v-if="isTextArea" v-model="inputData" :placeholder="placeholder" class="newItemInput notranslate" :class="id" v-on:keyup="editItem"/></textarea><input v-else v-model="inputData" :placeholder="placeholder" class="newItemInput notranslate" :class="id" v-on:keyup="editItem"/>',
    methods: {
        editItem: function () {
            this.$emit('update:data', this.inputData);
        }
    }
});

Vue.component('typeahead', {
    props: ['type', 'value', 'field'],
    mounted: function () {
        var scope = this;
        $('.typeaheadInput').typeahead(null, {
                name: 'new-job',
                display: 'normalized_job_title',
                source: jobsBloodhound
        }).bind('typeahead:select', function (ev, suggestion) {
                var result = suggestion.normalized_job_title;
                scope.$refs.input.value = result;
                scope.$emit('input', result);
        });
    },
    template: '<input ref="input" v-on:input="updateValue($event.target.value)" v-bind:value="value" class="typeaheadInput">',
    methods: {
        updateValue: function (value) {
            this.$refs.input.value = value;
            // Emit the number value through the input event
            this.$emit('input', value);
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
          var defaultData = fieldType.type === 'list' ? [] : ''
        scope.newItem[fieldType.key] = {
            type: fieldType.type,
            data: defaultData
        }
      });
    },
    methods: {
        editItem: function () {
            this.$emit('update:field', this.colData);
        },
        createNewItem: function () {
            this.showFieldTypes = true;
            this.$emit('editing');
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

Vue.component('list', {
    props: ['values', 'id', 'enableEdit', 'hideAdd', 'hasAutocomplete'],
    delimiters: ["[", "]"],
    data: function () {
        return {
            newItem: '',
            items: this.values ? _.map(this.values, function (val, i) {
                return {id: i, data: val}
            }) : [],
            editedItem: ''
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
        }
    },
    template: '#list',
    methods: {
        add: function () {
            if(this.newItem) {
                this.values.push(this.newItem);
                this.items.push({id: this.items.length, data: this.newItem});
                if(typeof ga !== 'undefined') {
                    ga('send', 'event', 'list', 'added', this.newItem, this.items.toString())
                }
                this.newItem = '';
            }
        },
        edit: function (index) {
            this.editedItem = index;
        },
        save: function (index) {
            Vue.set(this.values, index, this.items[index].data);
            this.editedItem = '';
        },
        updateList: function (oldVal, newVal) {
            this.items = _.each(this.items, function (item, i, items) {
                if(item === oldVal) {
                    Vue.set(items, i, newVal);
                }
            });
            this.$emit('update:values', this.items);
        },
        remove: function (index) {
            Vue.delete(this.values, index);
            Vue.delete(this.items, index);
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
        placeholder: data,

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
        placeholder: data,

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

var app = new Vue({
    delimiters: ["[", "]"],
    el: '#resume-preview',
    data: {
        resume: {
            name: createSingleCol('Name', 'Bob Jones', 'What is your name?', {isActive: true}),
            address: createSingleCol('Address', '1234 Main st', 'What is your street address?'),
            city: createSingleCol('City', 'Anchorage, AK', 'What is your city and state?'),
            email: createSingleCol('Email', 'me@email.com', 'What is your email address?'),
            phone: createSingleCol('Phone', '1(907) 555-1234', 'What is your phone number?'),
            objective: createDoubleCol('Objective', [createField('objective','paragraph', 'I want to save the world!')], "What's your objective? What do you want to learn during your next job?", {previewHeader: 'Objective'}),
            skills: createDoubleCol('Skills', [createField('skills','list', ['Hard working and reliable'], {hasAutocomplete:'skills'})], "What skills do you have?", {previewHeader: 'Skills and Abilities'}),
            education: createDoubleCol('Education', [createFieldSet([createField('name','field', 'UAA Community & Technical College', {style: 'bold'}), createField('dates','field', 'August 2001 - May 2003'), createField('description','list', ['Earned my Associate of Arts degree', 'Participated in various clubs']) ])], "What education do you have?", {fieldTypes: [{key: 'name', label: 'What was the name of the school or program?', type: 'field'}, {key:'dates', label: 'When did you attend?', type: 'field'}, {key:'description',label:'What certificate or degree did you earn? What skills did you learn?', type: 'list'}],label: 'Add an educational program:', previewHeader: 'Education and Certificates'}),
            work: createDoubleCol('Work', [createFieldSet([createField('name','field', 'The Trane Company', {style: 'bold'}), createField('title', 'field', 'Administrative Assistant', {hasAutocomplete: 'jobs'}), createField('dates','field', 'June 2009 - March 2011'), createField('description','list', ['Managed the front desk', 'Organized office events']) ])], "What work have you done?", {fieldTypes: [{key: 'name', label: 'What was the name of the place you worked?', type: 'field'}, {key: 'title', label: 'What type of job did you do?', type: 'field'}, {key:'dates', label: 'When did you work here?', type: 'field'}, {key:'description',label:'What kind of things did you do?', type: 'list'}],label: 'Add work:', previewHeader: 'Work and Experience'})

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
        printResume: function (type) {
            var requestData = {
                data: [],
                template: this.templateSelected
            };
            var url = type === 'pdf' ? "/resume/print" : '/resume/doc',
                contentType = type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                fileName = type === 'pdf' ? 'resume.pdf' : 'resume.docx';

            _.each(this.resume, function (field, key) {
                var serializedField = field.serialize();
                requestData.data.push(serializedField);
            });



            csrfTokenSetup();
            $.ajax({
                cache: false,
                url : url,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(requestData),
                processData: false,
                success : function(response){
                    window.location = '/resume/download?file='+response.fileName+'&type='+contentType+'&name='+fileName;
                },
                error : function(callback){

                }
            });
        }
    }
});