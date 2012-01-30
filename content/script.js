var req;
var doc;
	
function init()
{
	req = new XMLHttpRequest();
	req.open("GET", "event.json", true);
	req.onreadystatechange = fileJSONParsed;
	req.send(null); 
	
	showListPlace();
}

function fileJSONParsed()
{
	if (req.readyState == 4) 
		doc = eval('(' + req.responseText + ')');
}

function showCoord()
{
	var menulistPlace = document.getElementById("menulistPlace");
	menulistPlace.setAttribute("hidden", "true");
	
	var lat = document.getElementById("lat");
	var lgt = document.getElementById("lgt");
	var menulistLat = document.getElementById("menulistLat");
	var menulistLgt = document.getElementById("menulistLgt");
	var bt_visualiser = document.getElementById("bt_visualiser");
	
	lat.removeAttribute("hidden");
	lgt.removeAttribute("hidden");
	menulistLat.removeAttribute("hidden");
	menulistLgt.removeAttribute("hidden");
	bt_visualiser.removeAttribute("hidden");
}

function showListPlace()
{
	var lat = document.getElementById("lat");
	var lgt = document.getElementById("lgt");
	var menulistLat = document.getElementById("menulistLat");
	var menulistLgt = document.getElementById("menulistLgt");
	var bt_visualiser = document.getElementById("bt_visualiser");
	
	lat.setAttribute("hidden", "true");
	lgt.setAttribute("hidden", "true");
	menulistLat.setAttribute("hidden", "true");
	menulistLgt.setAttribute("hidden", "true");
	bt_visualiser.setAttribute("hidden", "true");
	
	var menulistPlace = document.getElementById("menulistPlace");
	menulistPlace.removeAttribute("hidden");
}
			
function locate()
{
	var lat = new Number(document.getElementById("lat").value);
	var lgt = new Number(document.getElementById("lgt").value);
	
	var directionN_S = document.getElementById("menulistLat").value;
	var directionE_O = document.getElementById("menulistLgt").value;
	
	if( directionN_S == "Sud" )
		lat = lat * -1;
	if( directionE_O == "Est" )
		lgt = lgt * -1;

	//alert(lat + " " + directionN_S + " " + lgt + " " + directionE_O);
	netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
	//window.openDialog("chrome://test/content/windowEVENT.xul", "", "", lat, lgt);
	window.openDialog("windowEVENT.xul", "", "", lat, lgt);
}

function fillPlace()
{
	var menulist = document.getElementById("menulistPlace");
	if( menulist.itemCount == 0 )
	{
		var listPopup = document.getElementById("menupopupPlace");
		
		for(var i = 0; i < doc.event.length; i++)
		{
			var menuitem = document.createElement("menuitem");
			menuitem.setAttribute('label', doc.event[i].place);
			menuitem.setAttribute('value', doc.event[i].place);
			listPopup.appendChild(menuitem);
		}
	}
}

function fillNature()
{
	var menulist = document.getElementById("menulistNature");
	if( menulist.itemCount == 0 )
	{
		var listPopup = document.getElementById("menupopupNature");
		
		for(var i = 0; i < doc.event.length; i++)
		{
			var menuitem = document.createElement("menuitem");
			menuitem.setAttribute('label', doc.event[i].nature);
			menuitem.setAttribute('value', doc.event[i].nature);
			listPopup.appendChild(menuitem);
		}
	}
}

function fillResources()
{
	var nature = document.getElementById("menulistNature").selectedIndex;
	var treeChildren = document.getElementById("ResourcesTreeChildren");
	
	while (treeChildren.firstChild) 
		treeChildren.removeChild(treeChildren.firstChild);
	
	for(var i = 0; i < doc.event[nature].resources.length; i++)
	{
		var treeItem = document.createElement("treeitem");
		var treeRow = document.createElement("treerow");
		var treeCell1 = document.createElement("treecell");
		var treeCell2 = document.createElement("treecell");
		
		treeCell1.setAttribute('label', doc.event[nature].resources[i].col1);
		treeCell1.setAttribute('value', doc.event[nature].resources[i].col1);
		treeCell2.setAttribute('label', doc.event[nature].resources[i].col2);
		treeCell2.setAttribute('value', doc.event[nature].resources[i].col2);
		
		treeRow.appendChild(treeCell1);
		treeRow.appendChild(treeCell2);
		treeItem.appendChild(treeRow);
		treeChildren.appendChild(treeItem);
	}
}

function addResource()
{
	var nature = document.getElementById("menulistNature").selectedIndex;
	var treeChildren = document.getElementById("ResourcesTreeChildren");

	var treeItem = document.createElement("treeitem");
	var treeRow = document.createElement("treerow");
	var treeCell1 = document.createElement("treecell");
	var treeCell2 = document.createElement("treecell");
	
	treeCell1.setAttribute('label', "new Resource col1");
	treeCell1.setAttribute('value', "new Resource col1");
	treeCell2.setAttribute('label', "new Resource col2");
	treeCell2.setAttribute('value', "new Resource col2");
	
	treeRow.appendChild(treeCell1);
	treeRow.appendChild(treeCell2);
	treeItem.appendChild(treeRow);
	treeChildren.appendChild(treeItem);
}

function addEvent()
{
	
}