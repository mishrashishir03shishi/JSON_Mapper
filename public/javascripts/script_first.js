var jsondata = "<%= arr %>";
console.log(jsondata);
$.jstree.defaults.core.themes.variant = "large";

$(function () {

    //var jsondata = $('#tree1').attr("data-array");
	//console.log(jsondata);
	var jsondata_source = jsondata;
	var identifier_target = $('#tree');
	var identifier_source = $('#tree1');
    createJSTree(jsondata, identifier_target);
	createJSTree(jsondata_source, identifier_source);

});

function createJSTree(jsondata, identifier) {            
    identifier
	.on('changed.jstree', function (e, data) {
		var i, j, r = [];
		for(i = 0, j = data.selected.length; i < j; i++) {
		  r.push(data.instance.get_node(data.selected[i]).text);
		}
		$('#event_result').html('Selected: ' + r.join(', '));
		
	  })
	.jstree({
        'core': {
            'data': jsondata
        },
		
    });
}