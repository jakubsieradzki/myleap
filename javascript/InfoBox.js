function InfoBox(infoName) {
	this.name = infoName;
	this.infos = {};	
}

InfoBox.prototype.TABLE_CLASS = "info";
InfoBox.prototype.HEADER_CLASS = "info-header";

InfoBox.prototype.addInfo = function(key) {
	var prefix = this.name.toLowerCase().replace(/\s/g, "-");	
	var value = prefix + "-" + key + "-id";
	this.infos[key] = value;
};

InfoBox.prototype.addValue = function(key, value) {
	var id = this.infos[key];
	// validation
	if (id === undefined) {
		console.warn("No key in map: " + key);
		return;
	}
	var element = document.getElementById(id);
	element.innerHTML = value;
};

InfoBox.prototype.addToParent = function(parent) {
	var tableNode = document.createElement("table");
	tableNode.className = this.TABLE_CLASS;
	var tbodyNode = document.createElement("tbody")
	tableNode.appendChild(tbodyNode);

	// header
	var headerRow = document.createElement("th");
	headerRow.appendChild(document.createTextNode(this.name));
	headerRow.className = this.HEADER_CLASS;
	headerRow.setAttribute("colspan", "2");
	var row = document.createElement("tr");
	row.appendChild(headerRow);
	tbodyNode.appendChild(row);

	// rows
	for (key in this.infos) {
		var trNode = document.createElement("tr");
		var keyNode = document.createElement("td");
		var valueNode = document.createElement("td");

		keyNode.innerHTML = key;
		keyNode.className = "key-col"
		valueNode.setAttribute("id", this.infos[key])

		trNode.appendChild(keyNode);
		trNode.appendChild(valueNode);
		tbodyNode.appendChild(trNode);
	}
	parent.appendChild(tableNode);
};


