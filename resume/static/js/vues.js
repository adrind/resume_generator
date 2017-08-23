Vue.component('resume-field', {
  props: ['data', 'id'],
  template: '<div>{{data}}</div>'
});


var app = new Vue({
    delimiters: ["[", "]"],
    el: '#resume-preview',
    data: {
        resume: [
            {id: 'name', data: 'Adrienne Dreyfus', message: 'What is your name?', isActive: true},
            {id: 'address', data: '3099 Washington st', message: 'What is your address?'},
            {id: 'city', data: 'San Francisco, CA', message: 'What is your city?'}
        ]
    },
    methods: {
        nextButtonClicked: function (event) {

            // `this` inside methods points to the Vue instance
        }
    }
});