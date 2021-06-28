$('#tog').hide();
$('#tog2').hide();
function walk(obj, root,  get) {   
    var data = [];
    var i = 0;     
    for (var key in obj) {         
        var item = {};     
		  
        if(Array.isArray(obj[key])){
            item["text"] = key+"(Array)" ;
        }
        else{
            item["text"] = key;
        }
		get.push(root + item.text + '/'); 
        i++;        
        if (obj[key] instanceof Object ) {                
            item["children"] = walk(obj[key], root + item.text + '/', get);                 
        }
           
        data.push(item);  	
        
    }        
    return data;
}




 var king = {
	"authRequire": "Y",
	"data": [
		{
			"poExternalNumber": "",
			"buyerId": "",
			"buyerName": "",
			"supplierId": "",
			"supplierName": "",
			"paymentTerms": "",
			"commodityList": [
				{
					"commodityCode": "",
					"commodityName": "",
					"unitWeight": 0
				}
			],
			"programId": "",
			"preAccepted": "",
			"basePoAmount": 0
		}
	]
};

var source = {
	"orders": [
		{
			"referenceNo": "",
			"externalReferenceId": null,
			"partyId": "",
			"partyName": "",
			"associatedParty": {
				"id": "",
				"name": "",
				"address": null
			},
			"programCode": "",
			"programName": "",
			"grossAmount": 0,
			"preAccepted": false,
			"paymentTerms": "cash",
			"commodities": [
				{
					"code": "",
					"name": "",
					"weight": 0,
					"type":"A"					
				},
				{
					"code": "",
					"name": "",
					"weight": 0,
					"type":"B"	
				}
			]
		}
	]
};

var root = "root<>/";

var target_menu = [];
var json_string = JSON.stringify(king);
var json_data = JSON.parse(json_string);
var result = walk(json_data, root, target_menu);
console.log(target_menu);

var source_menu = [];
var json_string_source = JSON.stringify(source);
var json_data_source = JSON.parse(json_string_source);
var result_source = walk(json_data_source, root, source_menu);
console.log(source_menu);
 
for (var i = 0; i < source_menu.length; i++) { 
	$('#dropdown').append(new Option(source_menu[i],++i));
}

for (var i = 0; i < target_menu.length; i++) { 
	$('#dropdown2').append(new Option(target_menu[i],++i));
	$('#dropdown3').append(new Option(target_menu[i],++i));
}



$('#source_btn').on('click', function(){
	
	var text = $('#dropdown :selected').text();
	if(text!=="Select")
		$('#ul').append('<li class="list-group-item">'+text+'         '+
		' <span id="badge" style="cursor: pointer;" class="badge bg-secondary">Delete</span></li>');	
});

$('body').on('click','#badge', function () {
	console.log("ok");
	$(this).parent().remove();
  });

  $('#target_btn').click(function(){
	
	var text = $('#dropdown2 :selected').text();
	if(text!=="Select")
		$('#ul2').append('<li class="list-group-item">'+text+'         '+
		' <span id="badge" style="cursor: pointer;" class="badge bg-secondary">Delete</span></li>');	
});




$('#ifcheck').on('change',
    function(){
        if ($(this).is(':checked')) {
			$('#tog').show();
        }
		else{
			$('#tog').hide();
		}
    });


	$('#wrapperifcheck').on('change',
    function(){
        if ($(this).is(':checked')) {
			$('#tog2').show();
        }
		else{
			$('#tog2').hide();
		}
    });
