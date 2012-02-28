function keyIsAlreadyExist(key) {
	var treeChildren = document.getElementById("item-resources");
	if( treeChildren.view != null ) {
		if( treeChildren.view.rowCount > 0 ) {
			for(var i = 0; i < treeChildren.view.rowCount; i++) {
				var cellKey = treeChildren.view.getCellText(i, treeChildren.columns.getNamedColumn('col1'));
				if( cellKey == key )
					return true;
			}
		}
	}
	return false;
}

function addResource(key, value) {
	if(keyIsAlreadyExist(key))
		return;
		
	var treeChildren = document.getElementById("ResourcesTreeChildren");
	
	var treeItem = document.createElement("treeitem");
	var treeRow = document.createElement("treerow");
	var treeCell1 = document.createElement("treecell");
	var treeCell2 = document.createElement("treecell");
	
	if( key == "" ) {
		key = "key" + (document.getElementById("item-resources").view.rowCount + 1);
		value = "value" + (document.getElementById("item-resources").view.rowCount + 1);
	}
		
	treeCell1.setAttribute('label', key);
	treeCell1.setAttribute('value', key);
	treeCell2.setAttribute('label', value);
	treeCell2.setAttribute('value', value);
	
	treeRow.appendChild(treeCell1);
	treeRow.appendChild(treeCell2);
	treeItem.appendChild(treeRow);
	treeChildren.appendChild(treeItem);
}

function AddResourcesFromNature(item) {
	var treeChildren = document.getElementById("ResourcesTreeChildren");
	while (treeChildren.firstChild)
		treeChildren.removeChild(treeChildren.firstChild);
		
	if( getElementValue("item-nature") == "" ) {		
		document.getElementById("event-grid-resources-row").hidden = true;
		document.getElementById("event-button-resources-row").hidden = true;
	}
	else {
		document.getElementById("event-grid-resources-row").hidden = false;
		document.getElementById("event-button-resources-row").hidden = false;
		
		if(item == null) {
			let listener = {
					onOperationComplete:
						function onOperationComplete(aCalendar, aStatus, aOperationType, aId, aDateTime) {
						},
					onGetResult:
						function onGetResult(aCalendar, aStatus, aItemType, aDetail, aCount, aItems) {
							for each (var t in aItems) {
								if( t.hasProperty("X-MOZ-EVENT-NATURE-NAME") ) {
									var natureName = getElementValue("item-nature");
									if( t.hasProperty("X-MOZ-EVENT-NATURE-RESOURCES-ASSOCIATIONS") ) {
										var natureResourcesAssociations = t.getProperty("X-MOZ-EVENT-NATURE-RESOURCES-ASSOCIATIONS");
										var natureNameTmp = natureResourcesAssociations.split("%20%");
										if( natureName == natureNameTmp[0] ) {
											var natureRessourcesTmp = natureNameTmp[1].split(";");
											for( var i = 0; i < natureRessourcesTmp.length - 1; i++ ) {
												var resourceKeyName = "X-MOZ-EVENT-NATURE-RESOURCE_" + natureRessourcesTmp[i];
												if( t.hasProperty(resourceKeyName) ) {
													var resourceValueName = t.getProperty(resourceKeyName);
													addResource(natureRessourcesTmp[i], resourceValueName);
												}
											}
										}
									}
								}
							}
						}
				};
			window.opener.getCompositeCalendar().getItems(Components.interfaces.calICalendar.ITEM_FILTER_TYPE_EVENT, 0, null, null, listener);
		}
		else
		{
			if( item.hasProperty("X-MOZ-EVENT-NATURE-NAME") ) {
				var natureName = getElementValue("item-nature");
				if( item.hasProperty("X-MOZ-EVENT-NATURE-RESOURCES-ASSOCIATIONS") ) {
					var natureResourcesAssociations = item.getProperty("X-MOZ-EVENT-NATURE-RESOURCES-ASSOCIATIONS");
					var natureNameTmp = natureResourcesAssociations.split("%20%");
					if( natureName == natureNameTmp[0] ) {
						var natureRessourcesTmp = natureNameTmp[1].split(";");
						for( var i = 0; i < natureRessourcesTmp.length - 1; i++ ) {
							var resourceKeyName = "X-MOZ-EVENT-NATURE-RESOURCE_" + natureRessourcesTmp[i];
							if( item.hasProperty(resourceKeyName) ) {
								var resourceValueName = item.getProperty(resourceKeyName);
								addResource(natureRessourcesTmp[i], resourceValueName);
							}
						}
					}
				}
			}
		}
	}
}

function showListLocation() {
	document.getElementById("Location-lat").hidden = true;
	document.getElementById("Location-lgt").hidden = true;
	document.getElementById("iFrameGeo").hidden = true;
	
	document.getElementById("item-NewLocation").hidden = false;
}

function showGeoLocation() {
	var iOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
	if( iOService.offline )
	{
		alert("Vous devez être connecté à Internet pour utiliser la géolocalisation");
		document.getElementById("Location-geo").setAttribute("selected", "false");
		document.getElementById("Location-name").setAttribute("selected", "true");
		showListLocation();
		return;
	}
	
	var geolocation = Components.classes["@mozilla.org/geolocation;1"].getService(Components.interfaces.nsIDOMGeoGeolocation);
	
	document.getElementById("item-NewLocation").hidden = true;
	var iFrameGeo = document.getElementById("iFrameGeo");
	if( getElementValue("Location-lat") == 0 && getElementValue("Location-lgt") == 0 )
	{
		geolocation.getCurrentPosition(function(position) {
			setElementValue("Location-lat", position.coords.latitude);
			setElementValue("Location-lgt", position.coords.longitude);
			iFrameGeo.hidden = false;
			iFrameGeo.contentWindow.initGMap(position.coords.latitude, position.coords.longitude);
		});
	}
	else
	{
		iFrameGeo.hidden = false;
		iFrameGeo.contentWindow.initGMap(getElementValue("Location-lat"), getElementValue("Location-lgt"));
	}
	
	document.getElementById("Location-lat").hidden = true;
	document.getElementById("Location-lgt").hidden = true;
}

function setLat(newLat) {
	setElementValue("Location-lat", newLat);
}

function setLgt(newLgt) {
	setElementValue("Location-lgt", newLgt);
}

function appendItems(aItem, aMenuList, aList, aMenuListSelected, aCommand) {

	while (aMenuList.hasChildNodes()) {
       aMenuList.removeChild(aMenuList.lastChild);
    }

    var indexToSelect = 0;
    for (var i in aList) {
        addMenuItem(aMenuList, aList[i], aList[i], aCommand);
		if( aMenuListSelected == aMenuList.getItemAtIndex(i).value )
			indexToSelect = i;
	}	
    return indexToSelect;
}

function loadDialog(item) {
    setElementValue("item-title", item.title);
    
	/**
	* JULIEN LACROIX
	* LOCATION
	**/
	// BEGIN
	if( item.hasProperty("GEOLOC_ACTIV") ) {
		var geolocationActived = item.getProperty("GEOLOC_ACTIV");
		if( geolocationActived && geolocationActived.length ) {
			if( geolocationActived == "true" ) {
				var geolocationLatitude = item.getProperty("LOCATION_LATITUDE");
				var geolocationLongitude = item.getProperty("LOCATION_LONGITUDE");
				if( geolocationLatitude && geolocationLongitude ) {
					document.getElementById("Location-geo").setAttribute("selected", "true");
					document.getElementById("Location-name").setAttribute("selected", "false");
					setElementValue("Location-lat", geolocationLatitude);
					setElementValue("Location-lgt", geolocationLongitude);
					showGeoLocation();
				}
			}
			else {
				var location = item.getProperty("LOCATION");
				if( location && location.length ) {
					document.getElementById("Location-geo").setAttribute("selected", "false");
					document.getElementById("Location-name").setAttribute("selected", "true");
					showListLocation();
				}
			}
		}
	}
	else {
		document.getElementById("Location-geo").setAttribute("selected", "false");
		document.getElementById("Location-name").setAttribute("selected", "true");
		showListLocation();
	}
	
	var locationList = new Array;
	let listener = {
            onOperationComplete:
				function onOperationComplete(aCalendar, aStatus, aOperationType, aId, aDateTime) {
				},
            onGetResult:
				function onGetResult(aCalendar, aStatus, aItemType, aDetail, aCount, aItems) {
					locationList.push("");
					for each (var t in aItems) {
						if( t.hasProperty("LOCATION") ) {
							var bExist = false;
							var natureName = t.getProperty("LOCATION");
							for (var i = 0; i < locationList.length; i++) {
								if( natureName == locationList[i] )
									bExist = true;
							}
							if(!bExist)
								locationList.push(natureName);
						}
					}
					var locationMenuListSelected = "";
					if( item.hasProperty("LOCATION") )
						locationMenuListSelected = item.getProperty("LOCATION");
					
					var locationMenuList = document.getElementById("item-NewLocation");
					var indexToSelect = appendItems(item, locationMenuList, locationList, locationMenuListSelected);
					locationMenuList.selectedIndex = indexToSelect;
				}
        };
	window.opener.getCompositeCalendar().getItems(Components.interfaces.calICalendar.ITEM_FILTER_TYPE_EVENT, 0, null, null, listener);
	
	/**
	* JULIEN LACROIX
	* X-MOZ-EVENT-NATURE-NAME
	**/
	var natureList = new Array;
	let listener = {
            onOperationComplete:
				function onOperationComplete(aCalendar, aStatus, aOperationType, aId, aDateTime) {
				},
            onGetResult:
				function onGetResult(aCalendar, aStatus, aItemType, aDetail, aCount, aItems) {
					natureList.push("");
					for each (var t in aItems) {
						if( t.hasProperty("X-MOZ-EVENT-NATURE-NAME") ) {
							var bExist = false;
							var natureName = t.getProperty("X-MOZ-EVENT-NATURE-NAME");
							for (var i = 0; i < natureList.length; i++) {
								if( natureName == natureList[i] )
									bExist = true;
							}
							if(!bExist)
								natureList.push(natureName);
						}
					}
					var natureMenuListSelected = "";
					if( item.hasProperty("X-MOZ-EVENT-NATURE-NAME") )
						natureMenuListSelected = item.getProperty("X-MOZ-EVENT-NATURE-NAME");
					
					var natureMenuList = document.getElementById("item-nature");
					var indexToSelect = appendItems(item, natureMenuList, natureList, natureMenuListSelected);
					natureMenuList.selectedIndex = indexToSelect;
					AddResourcesFromNature(item);
				}
        };
	window.opener.getCompositeCalendar().getItems(Components.interfaces.calICalendar.ITEM_FILTER_TYPE_EVENT, 0, null, null, listener);
	// END
	
    loadDateTime(item);

    // add calendars to the calendar menulist
    var calendarList = document.getElementById("item-calendar");
    var indexToSelect = appendCalendarItems(item, calendarList, window.arguments[0].calendar);
    if (indexToSelect > -1) {
        calendarList.selectedIndex = indexToSelect;
    }

    // Categories
    var categoryMenuList = document.getElementById("item-categories");
    var indexToSelect = appendCategoryItems(item, categoryMenuList);

    categoryMenuList.selectedIndex = indexToSelect;

    // Attachment
    var hasAttachments = capSupported("attachments");
    var attachments = item.getAttachments({});
    if (hasAttachments && attachments && attachments.length > 0) {
        for each (var attachment in attachments) {
            addAttachment(attachment);
        }
    } else {
        updateAttachment();
    }

    // URL link
    updateLink();

    // Description
    setElementValue("item-NewDescription", item.getProperty("DESCRIPTION"));

    // Status
    if (isEvent(item)) {
        gStatus = item.hasProperty("STATUS") ?
            item.getProperty("STATUS") : "NONE";
        updateStatus();
    } else {
        let todoStatus = document.getElementById("todo-status");
        setElementValue(todoStatus, item.getProperty("STATUS"));
        if (!todoStatus.selectedItem) {
            // No selected item means there was no <menuitem> that matches the
            // value given. Select the "NONE" item by default.
            setElementValue(todoStatus, "NONE");
        }
    }

    // Task completed date
    if (item.completedDate) {
        updateToDoStatus(item.status, item.completedDate.jsDate);
    } else {
        updateToDoStatus(item.status);
    }

    // Task percent complete
    if (isToDo(item)) {
        var percentCompleteInteger = 0;
        var percentCompleteProperty = item.getProperty("PERCENT-COMPLETE");
        if (percentCompleteProperty != null) {
            percentCompleteInteger = parseInt(percentCompleteProperty);
        }
        if (percentCompleteInteger < 0) {
            percentCompleteInteger = 0;
        } else if (percentCompleteInteger > 100) {
            percentCompleteInteger = 100;
        }
        setElementValue("percent-complete-textbox", percentCompleteInteger);
    }

    // Set Item-Menu label to Event or Task
    let menuItem = document.getElementById("item-menu");
    menuItem.setAttribute("label", calGetString("calendar-event-dialog",
                                          cal.isEvent(item) ? "itemMenuLabelEvent" : "itemMenuLabelTask"));
    menuItem.setAttribute("accesskey", calGetString("calendar-event-dialog",
                                          cal.isEvent(item) ? "itemMenuAccesskeyEvent2" : "itemMenuAccesskeyTask2"));

    // Priority
    gPriority = parseInt(item.priority);
    updatePriority();

    // Privacy
    gPrivacy = item.privacy;
    updatePrivacy();

    // load repeat details
    loadRepeat(item);

    // load reminder details
    loadReminders(item.getAlarms({}));

    // hide rows based on if this is an event or todo
    updateStyle();

    // Synchronize link-top-image with keep-duration-button status
    let keepAttribute = document.getElementById("keepduration-button").getAttribute("keep") == "true";
    setBooleanAttribute("link-image-top", "keep", keepAttribute);

    updateDateTime();

    updateCalendar();

    // figure out what the title of the dialog should be and set it
    updateTitle();

    let notifyCheckbox = document.getElementById("notify-attendees-checkbox");
    if (canNotifyAttendees(item.calendar, item)) {
        // visualize that the server will send out mail:
        notifyCheckbox.checked = true;
    } else {
        let itemProp = item.getProperty("X-MOZ-SEND-INVITATIONS");
        notifyCheckbox.checked = (item.calendar.getProperty("imip.identity") &&
                                  ((itemProp === null)
                                   ? getPrefSafe("calendar.itip.notify", true)
                                   : (itemProp == "TRUE")));
    }

    updateAttendees();
    updateRepeat(true);
    updateReminder(true);

    gShowTimeAs = item.getProperty("TRANSP");
    updateShowTimeAs();
}

function saveDialog(item) {
    // Calendar
    item.calendar = getCurrentCalendar();

    setItemProperty(item, "title", getElementValue("item-title"));
    
	/**
	* JULIEN LACROIX
	* LOCATION
	**/
	// BEGIN
	var geoLocation = document.getElementById("Location-geo");
	if( geoLocation.getAttribute('selected') == "true" ) {
		setItemProperty(item, "LOCATION", "");
		setItemProperty(item, "GEOLOC_ACTIV", "true");
		setItemProperty(item, "LOCATION_LATITUDE", getElementValue("Location-lat")); 
		setItemProperty(item, "LOCATION_LONGITUDE", getElementValue("Location-lgt"));
	} else {
		setItemProperty(item, "LOCATION_LATITUDE", "");
		setItemProperty(item, "LOCATION_LONGITUDE", "");
		setItemProperty(item, "GEOLOC_ACTIV", "false");
		setItemProperty(item, "LOCATION", getElementValue("item-NewLocation"));
	}

	/**
	* JULIEN LACROIX
	* X-MOZ-EVENT-NATURE-NAME
	* EX: 
	* "X-MOZ-EVENT-NATURE-NAME" => "coursUML"
	**/
	var nature = getElementValue("item-nature");
	setItemProperty(item, "X-MOZ-EVENT-NATURE-NAME", nature);
	
	/**
	* JULIEN LACROIX
	* X-MOZ-EVENT-NATURE-RESOURCE
	* EX: 
	* "X-MOZ-EVENT-NATURE-RESOURCES-ASSOCIATIONS" => "coursUML%20%VIDEOPROJECTEUR;"
	* "X-MOZ-EVENT-NATURE-RESOURCE_VIDEOPROJECTEUR" => "OUI"
	**/
	var resourceTreeElement = document.getElementById("item-resources");
	if( resourceTreeElement.view != null ) {
		if( resourceTreeElement.view.rowCount > 0 ) {
			var resources_association = "";
			resources_association += getElementValue("item-nature");
			resources_association += "%20%";
			for(var i = 0; i < resourceTreeElement.view.rowCount; i++) {
				var cellText1 = resourceTreeElement.view.getCellText(i, resourceTreeElement.columns.getNamedColumn('col1'));
				var cellText2 = resourceTreeElement.view.getCellText(i, resourceTreeElement.columns.getNamedColumn('col2'));
				
				if( cellText1 != "" ) {
					resources_association += cellText1;
					resources_association += ";";
					var resourceKeyName = "X-MOZ-EVENT-NATURE-RESOURCE_" + cellText1;
					setItemProperty(item, resourceKeyName, cellText2);
				}
			}
			setItemProperty(item, "X-MOZ-EVENT-NATURE-RESOURCES-ASSOCIATIONS", resources_association);
		}
	}
	//END
	
    saveDateTime(item);

    if (isToDo(item)) {
        var percentCompleteInteger = 0;
        if (getElementValue("percent-complete-textbox") != "") {
            percentCompleteInteger =
                parseInt(getElementValue("percent-complete-textbox"));
        }
        if (percentCompleteInteger < 0) {
            percentCompleteInteger = 0;
        } else if (percentCompleteInteger > 100) {
            percentCompleteInteger = 100;
        }
        setItemProperty(item, "PERCENT-COMPLETE", percentCompleteInteger);
    }

    setCategory(item, "item-categories");

    // Attachment
    // We want the attachments to be up to date, remove all first.
    item.removeAllAttachments();

    // Now add back the new ones
    for each (var att in gAttachMap) {
        item.addAttachment(att);
    }

    // Description
    setItemProperty(item, "DESCRIPTION", getElementValue("item-NewDescription"));

    // Event Status
    if (isEvent(item)) {
        if(gStatus && gStatus != "NONE") {
            item.setProperty("STATUS", gStatus);
        } else {
            item.deleteProperty("STATUS");
        }
    } else {
        var status = getElementValue("todo-status");
        if (status != "COMPLETED") {
            item.completedDate = null;
        }
        setItemProperty(item, "STATUS", (status != "NONE") ? status : null);
    }

    // set the "PRIORITY" property if a valid priority has been
    // specified (any integer value except *null*) OR the item
    // already specifies a priority. in any other case we don't
    // need this property and can safely delete it. we need this special
    // handling since the WCAP provider always includes the priority
    // with value *null* and we don't detect changes to this item if
    // we delete this property.
    if (capSupported("priority") &&
        (gPriority || item.hasProperty("PRIORITY"))) {
        item.setProperty("PRIORITY", gPriority);
    } else {
        item.deleteProperty("PRIORITY");
    }

    // Transparency
    if (gShowTimeAs) {
        item.setProperty("TRANSP", gShowTimeAs);
    } else {
        item.deleteProperty("TRANSP");
    }

    // Privacy
    setItemProperty(item, "CLASS", gPrivacy, "privacy");

    if (item.status == "COMPLETED" && isToDo(item)) {
        var elementValue = getElementValue("completed-date-picker");
        item.completedDate = jsDateToDateTime(elementValue);
    }

    saveReminder(item);
}

function onLoad() {
    // first of all retrieve the array of
    // arguments this window has been called with.
    var args = window.arguments[0];

    // The calling entity provides us with an object that is responsible
    // for recording details about the initiated modification. the 'finalize'
    // property is our hook in order to receive a notification in case the
    // operation needs to be terminated prematurely. This function will be
    // called if the calling entity needs to immediately terminate the pending
    // modification. In this case we serialize the item and close the window.
    if (args.job) {
        // keep this context...
        var self = this;

        // store the 'finalize'-functor in the provided job-object.
        args.job.finalize = function() {
            // store any pending modifications...
            self.onAccept();

            var item = window.calendarItem;

            // ...and close the window.
            window.close();

            return item;
        }
    }

    window.fbWrapper = args.fbWrapper;

    // the most important attribute we expect from the
    // arguments is the item we'll edit in the dialog.
    var item = args.calendarEvent;

    // set the dialog-id to enable the right window-icon to be loaded.
    if (!cal.isEvent(item)) {
        setDialogId(document.documentElement, "calendar-task-dialog");
    }

    // new items should have a non-empty title.
    if (item.isMutable && (!item.title || item.title.length <= 0)) {
        item.title = calGetString("calendar-event-dialog",
                                  isEvent(item) ? "newEvent" : "newTask");
    }

    window.onAcceptCallback = args.onOk;
    window.mode = args.mode

    // we store the item in the window to be able
    // to access this from any location. please note
    // that the item is either an occurrence [proxy]
    // or the stand-alone item [single occurrence item].
    window.calendarItem = item;
    // store the initial date value for datepickers in New Task dialog
    window.initialStartDateValue = args.initialStartDateValue;

    // we store the array of attendees in the window.
    // clone each existing attendee since we still suffer
    // from the 'lost x-properties'-bug.
    window.attendees = [];
    var attendees = item.getAttendees({});
    if (attendees && attendees.length) {
        for each (var attendee in attendees) {
            window.attendees.push(attendee.clone());
        }
    }

    window.organizer = null;
    if (item.organizer) {
        window.organizer = item.organizer.clone();
    } else if (item.getAttendees({}).length > 0) {
        // previous versions of calendar may have filled ORGANIZER correctly on overridden instances:
        let orgId = item.calendar.getProperty("organizerId");
        if (orgId) {
            let organizer = cal.createAttendee();
            organizer.id = orgId;
            organizer.commonName = item.calendar.getProperty("organizerCN");
            organizer.role = "REQ-PARTICIPANT";
            organizer.participationStatus = "ACCEPTED";
            organizer.isOrganizer = true;
            window.organizer = organizer;
        }
    }

    // we store the recurrence info in the window so it
    // can be accessed from any location. since the recurrence
    // info is a property of the parent item we need to check
    // whether or not this item is a proxy or a parent.
    var parentItem = item;
    if (parentItem.parentItem != parentItem) {
        parentItem = parentItem.parentItem;
    }

    window.recurrenceInfo = null;
    if (parentItem.recurrenceInfo) {
        window.recurrenceInfo = parentItem.recurrenceInfo.clone();
    }

    document.documentElement.getButton("accept")
            .setAttribute("collapsed", "true");
    document.documentElement.getButton("cancel")
            .setAttribute("collapsed", "true");
    document.documentElement.getButton("cancel")
            .parentNode.setAttribute("collapsed", "true");

    // Set initial values for datepickers in New Tasks dialog
    if (isToDo(item)) {
        let initialDatesValue = args.initialStartDateValue.jsDate;
        setElementValue("completed-date-picker", initialDatesValue);
        setElementValue("todo-entrydate", initialDatesValue);
        setElementValue("todo-duedate", initialDatesValue);
    }
    loadDialog(window.calendarItem);

    opener.setCursor("auto");

    document.getElementById("item-title").focus();
    document.getElementById("item-title").select();

    // This causes the app to ask if the window should be closed when the
    // application is closed.
    Services.obs.addObserver(eventDialogQuitObserver,
                             "quit-application-requested", false);

    // Normally, Enter closes a <dialog>. We want this to rather on Ctrl+Enter.
    // Stopping event propagation doesn't seem to work, so just overwrite the
    // function that does this.
    document.documentElement._hitEnter = function() {};
	
	var grid = document.getElementById("event-grid");
	grid.setAttribute("style", "overflow: auto;");
}