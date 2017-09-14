$(function () {
    var skills = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: 'http://api.dataatwork.org/v1/skills/autocomplete?begins_with=%QUERY',
            wildcard: '%QUERY'
        }
    });

    $('.Skills .newListItemInput').typeahead(null, {
        name: 'new-skill',
        display: 'value',
        source: skills
    });
});