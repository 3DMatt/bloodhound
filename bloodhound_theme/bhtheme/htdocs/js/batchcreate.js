function emptyTable(products,href,token) {
	var numOfRows = document.getElementById("numOfRows").value;
	form_token = token.split(";")[0].split("=")[1];//I'm not really sure about this method
	if(numOfRows != "" && document.getElementById("empty-table") == null){
	var contentDiv = document.getElementById("content");
	//var headers = {"summary":"Summary","description":"Description","product":"Product","status":"Status","priority":"Priority","type":"Types","owner":"Owner","cc":"Cc","milestone":"Milestone","keywords":"Keywords"}
    var headers = {"summary":"Summary","description":"Description","product":"Product","status":"Status","priority":"Priority"}
	statuses = ["accepted", "assigned", "closed", "new", "reopened"];
	priorities = ["blocker", "critical", "major", "minor", "trivial"];
	types = ["defect", "enhancement", "task"];
	
	var div = document.createElement("div");
	div.setAttribute("class","span12");
	div.setAttribute("id","empty-table");
	var h2 = document.createElement("h2");
	h2.appendChild(document.createTextNode("Batch Create Tickets"));
	div.appendChild(h2);
	
	var form = document.createElement("form");
	form.setAttribute("id","bct-form");
	form.setAttribute("name","bct");
	form.setAttribute("method","post");
	
	var div_token = document.createElement("div");
	var form_token_val = document.createElement("input");
	form_token_val.setAttribute("type","hidden");
	form_token_val.setAttribute("name","__FORM_TOKEN");
	form_token_val.setAttribute("value",form_token);
	div_token.appendChild(form_token_val);
	form.appendChild(div_token);
	
	var table = document.createElement("table");
	table.setAttribute("class","listing tickets table table-bordered table-condensed query");
	table.setAttribute("style","border-radius: 0px 0px 4px 4px");
	
	var tr = document.createElement("tr");
	tr.setAttribute("class","trac-columns");
	for (header in headers){
		font = document.createElement("font");
		font.setAttribute("color","#1975D1");
		font.appendChild(document.createTextNode(headers[header]))
		th = document.createElement("th");
		th.appendChild(font);
		tr.appendChild(th);
	}
	table.appendChild(tr);
	
	tbody = document.createElement("tbody");
	for (i=0;i<numOfRows;i++){
		tr_rows = document.createElement("tr");
		for (header in headers){
			if (header == "summary"){
				td_row = document.createElement("td");
				input_summary = document.createElement("input");
				input_summary.setAttribute("type","text");
				input_summary.setAttribute("id","field-summary"+i);
				input_summary.setAttribute("class","input-block-level");
				input_summary.setAttribute("name","field_summary"+i);
				td_row.appendChild(input_summary);
				tr_rows.appendChild(td_row);
			}
			else if (header == "description") {
				td_row = document.createElement("td");
				input_description = document.createElement("textarea");
				input_description.setAttribute("id","field-description"+i);
				input_description.setAttribute("class","input-block-level");
				input_description.setAttribute("name","field_description"+i);
				input_description.setAttribute("rows","2");
				input_description.setAttribute("cols","28");
				td_row.appendChild(input_description);
				tr_rows.appendChild(td_row);
			}
			else if (header == "status") {
				td_row = document.createElement("td");
				input_status = document.createElement("select");
				input_status.setAttribute("id","field-status"+i);
				input_status.setAttribute("class","input-block-level");
				input_status.setAttribute("name","field_status"+i);
				for (status in statuses){
					option = document.createElement("option");
					option.setAttribute("value",statuses[status]);
					option.appendChild(document.createTextNode(statuses[status]));
					input_status.appendChild(option);
				}
				td_row.appendChild(input_status);
				tr_rows.appendChild(td_row);
			}
			else if (header == "priority") {
				td_row = document.createElement("td");
				input_priority = document.createElement("select");
				input_priority.setAttribute("id","field-priority"+i);
				input_priority.setAttribute("class","input-block-level");
				input_priority.setAttribute("name","field_priority"+i);
				for (priority in priorities){
					option = document.createElement("option");
					option.setAttribute("value",priorities[priority]);
					option.appendChild(document.createTextNode(priorities[priority]));
					input_priority.appendChild(option);
				}
				td_row.appendChild(input_priority);
				tr_rows.appendChild(td_row);
			}
			else if (header == "type") {
				td_row = document.createElement("td");
				input_type = document.createElement("select");
				input_type.setAttribute("id","field-type"+i);
				input_type.setAttribute("class","input-block-level");
				input_type.setAttribute("name","field_type"+i);
				for (type in types){
					option = document.createElement("option");
					option.setAttribute("value",types[type]);
					option.appendChild(document.createTextNode(types[type]));
					input_type.appendChild(option);
				}
				td_row.appendChild(input_type);
				tr_rows.appendChild(td_row);
			}
			else if (header == "product") {
				td_row = document.createElement("td");
				field_product = document.createElement("select");
				field_product.setAttribute("id","field-product"+i);
				field_product.setAttribute("class","input-block-level");
				field_product.setAttribute("name","field_product"+i);
				for (product in products){
					option = document.createElement("option");
					option.setAttribute("value",(products[product])[0]);
					option.appendChild(document.createTextNode((products[product])[1]));
					field_product.appendChild(option);
				}
				td_row.appendChild(field_product);
				tr_rows.appendChild(td_row);
			}
			else if (header == "owner"){
				td_row = document.createElement("td");
				input_owner = document.createElement("input");
				input_owner.setAttribute("type","text");
				input_owner.setAttribute("id","field-owner"+i);
				input_owner.setAttribute("class","input-block-level");
				input_owner.setAttribute("name","field_owner"+i);
				td_row.appendChild(input_owner);
				tr_rows.appendChild(td_row);
			}
			else if (header == "cc"){
				td_row = document.createElement("td");
				input_cc = document.createElement("input");
				input_cc.setAttribute("type","text");
				input_cc.setAttribute("id","field-cc"+i);
				input_cc.setAttribute("class","input-block-level");
				input_cc.setAttribute("name","field_cc"+i);
				td_row.appendChild(input_cc);
				tr_rows.appendChild(td_row);
			}
			else if (header == "milestone"){
				td_row = document.createElement("td");
				input_milestone = document.createElement("input");
				input_milestone.setAttribute("type","text");
				input_milestone.setAttribute("id","field-milestone"+i);
				input_milestone.setAttribute("class","input-block-level");
				input_milestone.setAttribute("name","field_milestone"+i);
				td_row.appendChild(input_milestone);
				tr_rows.appendChild(td_row);
			}
			else if (header == "keywords"){
				td_row = document.createElement("td");
				input_keywords = document.createElement("input");
				input_keywords.setAttribute("type","text");
				input_keywords.setAttribute("id","field-keywords"+i);
				input_keywords.setAttribute("class","input-block-level");
				input_keywords.setAttribute("name","field_keywords"+i);
				td_row.appendChild(input_keywords);
				tr_rows.appendChild(td_row);
			}
		}
		tbody.appendChild(tr_rows);
	}
	table.appendChild(tbody);
	form.appendChild(table);
	
    submit_button = document.createElement("button");
	submit_button.setAttribute("class","btn pull-right");
	submit_button.setAttribute("type","button");
	submit_button.setAttribute("onclick","submit_btn_action()");
	submit_button.setAttribute("id","bct-create");
	submit_button.setAttribute("data-target",href);
	submit_button.appendChild(document.createTextNode("save"));
	form.appendChild(submit_button);	
	
	cancle_button = document.createElement("button");
	cancle_button.setAttribute("class","btn pull-right");
	cancle_button.setAttribute("type","button");
	cancle_button.setAttribute("onclick","deleteForm()");
	cancle_button.appendChild(document.createTextNode("cancel"));
	form.appendChild(cancle_button);
	
	div.appendChild(form);
	contentDiv.appendChild(div);
	}

}

function submitForm(){
	document.getElementById("bct-form").submit();
}

function removeBatchCreate(){
	document.getElementById("bct-button").remove();
	document.getElementById("numOfRows").remove();
}

function deleteForm(){
	document.getElementById("empty-table").remove();
}

//$('#bct-create').click(
function submit_btn_action() {
        // data-target is the base url for the product in current scope
	var product_base_url = $('#bct-create').attr('data-target');
    if (product_base_url === '/')
        product_base_url = '';
        $.post(product_base_url , $('#bct-form').serialize(),
        function(ticket) {
			deleteForm();
			removeBatchCreate();
			
			var headers = {"id":"Ticket","summary":"Summary","product":"Product","status":"Status"}
			var contentDiv = document.getElementById("content");
			var div = document.createElement("div");
			div.setAttribute("class","span12");
			var h2 = document.createElement("h2");
			h2.appendChild(document.createTextNode("Created Tickets"));
			div.appendChild(h2);
			var table = document.createElement("table");
			table.setAttribute("class","listing tickets table table-bordered table-condensed query");
			table.setAttribute("style","border-radius: 0px 0px 4px 4px");
			tr = document.createElement("tr");
			tr.setAttribute("class","trac-columns");
			
			for (header in headers){
				th = document.createElement("th");
				font = document.createElement("font");
				font.setAttribute("color","#1975D1");
				font.appendChild(document.createTextNode(headers[header]))
				th = document.createElement("th");
				th.appendChild(font);
				tr.appendChild(th);
			}
			table.appendChild(tr);
			
			for ( i=0 ; i<Object.keys(ticket.tickets).length ; i++ ){
				tr = document.createElement("tr");
				for (j=0;j<4;j++){
					if(j==0){
						td = document.createElement("td");
						a = document.createElement("a");
						tkt = JSON.parse(ticket.tickets[i]);
						a.setAttribute("href",tkt.url);
						a.appendChild(document.createTextNode("#"+tkt.id));
						td.appendChild(a);
					}
					else if(j==1){
						td = document.createElement("td");
						a = document.createElement("a");
						tkt = JSON.parse(ticket.tickets[i]);
						a.setAttribute("href",tkt.url);
						a.appendChild(document.createTextNode(tkt.summary));
						td.appendChild(a);
					}
					else if(j==2){
						td = document.createElement("td");
						tkt = JSON.parse(ticket.tickets[i]);
						td.appendChild(document.createTextNode(tkt.product));
					}
					else if(j==3){
						td = document.createElement("td");
						tkt = JSON.parse(ticket.tickets[i]);
						td.appendChild(document.createTextNode(tkt.status));
					}
					tr.appendChild(td);
				}
				table.appendChild(tr);
			}
			div.appendChild(table);
			contentDiv.appendChild(div);     
        });
}
