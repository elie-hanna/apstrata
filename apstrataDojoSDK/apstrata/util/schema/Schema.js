dojo.provide('apstrata.util.schema.Schema');

dojo.declare("apstrata.util.schema.Schema", [], {})

/**
 * Schema constructor
 * @param {string} schemaName
 */
function Schema(schemaName)
{
	this.name = schemaName;
	this.fieldsArr = [];
	this.aclGroupArr = [];
}

/**
 * Add an acl group
 * @param {SchemaACLGroup} aclGroup
 */
Schema.prototype.addACLGroup = function(aclGroup)
{
	var tmpFieldsArr = aclGroup.getFields();
	for(var i=0; i < tmpFieldsArr.length; i++)
	{
		this.fieldsArr.push(tmpFieldsArr[i]);
	}
	this.aclGroupArr.push(aclGroup);
}

/**
 * Setter for schema acl
 * Example of a readACL="user1;user2"
 * @param {string} readACL
 * @param {string} writeACL
 * @param {string} deleteACL
 */
Schema.prototype.setSchemaACL = function(readACL, writeACL, deleteACL)
{
	this.schemaReadACL = readACL;
	this.schemaWriteACL = writeACL;
	this.schemaDeleteACL = deleteACL;
}

/**
 * Setter for document default acl
 * Example of a readACL="user1;user2"
 * @param {string} readACL
 * @param {string} writeACL
 * @param {string} deleteACL
 */
Schema.prototype.setDefaultACL = function(readACL, writeACL, deleteACL)
{
	this.defaultReadACL = readACL;
	this.defaultWriteACL = writeACL;
	this.defaultDeleteACL = deleteACL;
}

Schema.prototype.toString = function()
{
	var schema = "<schema>";
	
	//adding aclgroups
	schema += "<aclGroups>";
	for(var i=0; i < this.aclGroupArr.length; i++)
	{
		var currentAclGroup = this.aclGroupArr[i];
		schema += currentAclGroup.toString();
	}
	
	//adding default acl
	schema += "<defaultAcl>";
	if(this.defaultReadACL)
	{
		schema += "<read>" + this.defaultReadACL + "</read>";
	}
	
	if(this.defaultWriteACL)
	{
		schema += "<write>" + this.defaultWriteACL + "</write>";
	}
	
	if(this.defaultDeleteACL)
	{
		schema += "<delete>" + this.defaultDeleteACL + "</delete>";
	}
	schema += "</defaultAcl>";
	
	//adding schema acl
	schema += "<schemaAcl>";
	if(this.schemaReadACL)
	{
		schema += "<read>" + this.schemaReadACL + "</read>";
	}
	
	if(this.schemaWriteACL)
	{
		schema += "<write>" + this.schemaWriteACL + "</write>";
	}
	
	if(this.schemaDeleteACL)
	{
		schema += "<delete>" + this.schemaDeleteACL + "</delete>";
	}
	schema += "</schemaAcl>";
	schema += "</aclGroups>";
	
	schema += "<fields>";
	for(var i=0; i < this.fieldsArr.length; i++)
	{
		var currentField = this.fieldsArr[i];
		schema += currentField.toString();
	}
	schema += "</fields>";
	schema += "</schema>";
	return schema;
}

/**
 * 
 * @param {string} name
 * @param {string} readACL
 * @param {string} writeACL
 * @param {array} fieldsArray - array of SchemaField objects
 */
function SchemaACLGroup(name, readACL, writeACL, fieldsArray)
{
	this.name = name;
	this.readACL = readACL;
	this.writeACL = writeACL;
	this.fieldsArray = fieldsArray;
}

SchemaACLGroup.prototype.getFields = function()
{
	return this.fieldsArray;
}

SchemaACLGroup.prototype.toString = function()
{
	var st = "<aclGroup name=\"" + this.name + "\">";
	st += "<read>" + this.readACL + "</read>";
	st += "<write>" + this.writeACL + "</write>";
	st += "<fields>";
	for(var j=0; j < this.fieldsArray.length; j++)
	{
		var currentField = this.fieldsArray[j];
		st += "<field>" + currentField.name + "</field>";
	}
	st += "</fields>";
	st += "</aclGroup>";
	
	return st;
}

/**
 * Constructor
 * @param {string} name
 * @param {string} type - string | numeric | date
 * @param {boolean} isSearchable 
 */
function SchemaField(name, type, isSearchable)
{
	this.name = name;
	this.type = type;
	this.isSearchable = isSearchable;
}

/**
 * Specifies cardinality for the field
 * @param {int} minCard
 * @param {int} maxCard
 */
SchemaField.prototype.setCardinalities = function(minCard, maxCard)
{
	this.minCard = minCard;
	this.maxCard = maxCard;
}

/**
 * Specified a regex whereby values must satisfy
 * @param {string} regex
 */
SchemaField.prototype.setRegex = function(regex)
{
	this.regex = regex;
}

/**
 * Specifies range for dates and integers. Only applies for
 * values that are integer and dates
 * @param {int} min
 * @param {int} max
 */
SchemaField.prototype.setRange = function(min, max)
{
	this.rangeMin = min;
	this.rangeMax = max;
}

SchemaField.prototype.toString = function()
{
	var st = "<field name=\"" + this.name + "\" type=\"" + this.type + "\"";
	if(this.isSearchable)
	{
		st += " searchable=\"" + this.isSearchable + "\">";
	}
	else
	{
		st += ">";
	}
	st += "<validation>";
	if(this.minCard || this.maxCard)
	{
		st += "<cardinality";
		if(this.minCard)
		{
			st += " min=\"" + this.minCard + "\" "; 
		}
		if(this.maxCard)
		{
			st += " max=\"" + this.maxCard + "\" "; 
		}
		st += "></cardinality>";
	}
	
	if(this.regex)
	{
		st += "<regex>" + this.regex + "</regex>";
	}
	
	if(this.rangeMin || this.rangeMax)
	{
		st += "<range";
		if(this.rangeMin)
		{
			st += " min=\"" + this.rangeMin + "\" "; 
		}
		if(this.rangeMax)
		{
			st += " max=\"" + this.rangeMax + "\" "; 
		}
		st += "></range>";
	}
	st += "</validation>";
	st += "</field>";
	return st;
}