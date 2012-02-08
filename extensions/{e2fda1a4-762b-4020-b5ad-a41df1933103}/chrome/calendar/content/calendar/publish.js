/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2001-2002
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   ArentJan Banck <ajbanck@planet.nl>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
Components.utils.import("resource://calendar/modules/calUtils.jsm");

/**
 * publishCalendarData
 * Show publish dialog, ask for URL and publish all selected items.
 */
function publishCalendarData()
{
   var args = new Object();
   
   args.onOk =  self.publishCalendarDataDialogResponse;
   
   openDialog("chrome://calendar/content/publishDialog.xul", "caPublishEvents", 
              "chrome,titlebar,modal,resizable", args );
}

/**
 * publishCalendarDataDialogResponse
 * Callback method for publishCalendarData() that is called when the user
 * presses the OK button in the publish dialog.
 */
function publishCalendarDataDialogResponse(CalendarPublishObject, aProgressDialog)
{
    publishItemArray(currentView().getSelectedItems({}), 
                     CalendarPublishObject.remotePath, aProgressDialog);
}

/**
 * publishEntireCalendar
 * Show publish dialog, ask for URL and publish all items from the calendar.
 *
 * @param aCalendar   (optional) The calendar that will be published. If ommitted
 *                               the user will be prompted to select a calendar.
 */
function publishEntireCalendar(aCalendar)
{
    if (!aCalendar) {
        var count = new Object();
        var calendars = getCalendarManager().getCalendars(count);

        if (count.value == 1) {
            // Do not ask user for calendar if only one calendar exists
            aCalendar = calendars[0];
        } else {
            // Ask user to select the calendar that should be published.
            // publishEntireCalendar() will be called again if OK is pressed
            // in the dialog and the selected calendar will be passed in. 
            // Therefore return after openDialog().
            var args = new Object();
            args.onOk = publishEntireCalendar;
            args.promptText = calGetString("calendar", "publishPrompt");
            openDialog("chrome://calendar/content/chooseCalendarDialog.xul", 
                       "_blank", "chrome,titlebar,modal,resizable", args);
            return;
        }
    }

    var args = new Object();
    var publishObject = new Object( );

    args.onOk =  self.publishEntireCalendarDialogResponse;

    publishObject.calendar = aCalendar;

    // restore the remote ics path preference from the calendar passed in
    var remotePath = aCalendar.getProperty("remote-ics-path");
    if (remotePath && remotePath.length && remotePath.length > 0) {
        publishObject.remotePath = remotePath;
    }

    args.publishObject = publishObject;
    openDialog("chrome://calendar/content/publishDialog.xul", "caPublishEvents", 
               "chrome,titlebar,modal,resizable", args );

    return;
}

/**
 * publishEntireCalendarDialogResponse
 * Callback method for publishEntireCalendar() that is called when the user
 * presses the OK button in the publish dialog.
 */
function publishEntireCalendarDialogResponse(CalendarPublishObject, aProgressDialog)
{
    // store the selected remote ics path as a calendar preference
    CalendarPublishObject.calendar.setProperty("remote-ics-path", 
                                           CalendarPublishObject.remotePath);

    var itemArray = [];
    var getListener = {
        onOperationComplete: function(aCalendar, aStatus, aOperationType, aId, aDetail)
        {
            publishItemArray(itemArray, CalendarPublishObject.remotePath, aProgressDialog);
        },
        onGetResult: function(aCalendar, aStatus, aItemType, aDetail, aCount, aItems)
        {
            if (!Components.isSuccessCode(aStatus)) {
                aborted = true;
                return;
            }
            if (aCount) {
                for (var i=0; i<aCount; ++i) {
                    // Store a (short living) reference to the item.
                    var itemCopy = aItems[i].clone();
                    itemArray.push(itemCopy);
                }  
            }
        }
    };
    aProgressDialog.onStartUpload();
    var oldCalendar = CalendarPublishObject.calendar;
    oldCalendar.getItems(Components.interfaces.calICalendar.ITEM_FILTER_ALL_ITEMS,
                         0, null, null, getListener);

}

function publishItemArray(aItemArray, aPath, aProgressDialog) {
    var outputStream;
    var inputStream;
    var storageStream;

    var icsURL = makeURL(aPath);

    var channel = cal.getIOService().newChannelFromURI(icsURL);
    if (icsURL.schemeIs('webcal'))
        icsURL.scheme = 'http';
    if (icsURL.schemeIs('webcals'))
        icsURL.scheme = 'https';

    switch(icsURL.scheme) {
        case 'http':
        case 'https':
            channel = channel.QueryInterface(Components.interfaces.nsIHttpChannel);
            break;
        case 'ftp':
            channel = channel.QueryInterface(Components.interfaces.nsIFTPChannel);
            break;
        case 'file':
            channel = channel.QueryInterface(Components.interfaces.nsIFileChannel);
            break;
        default:
            dump("No such scheme\n");
            return;
    }

    var uploadChannel = channel.QueryInterface(Components.interfaces.nsIUploadChannel);
    uploadChannel.notificationCallbacks = notificationCallbacks;

    storageStream = Components.classes["@mozilla.org/storagestream;1"]
                                  .createInstance(Components.interfaces.nsIStorageStream);
    storageStream.init(32768, 0xffffffff, null);
    outputStream = storageStream.getOutputStream(0);

    var serializer = Components.classes["@mozilla.org/calendar/ics-serializer;1"]
                               .createInstance(Components.interfaces.calIIcsSerializer);
    serializer.addItems(aItemArray, aItemArray.length);
    // Outlook requires METHOD:PUBLISH property:
    var methodProp = getIcsService().createIcalProperty("METHOD");
    methodProp.value = "PUBLISH";
    serializer.addProperty(methodProp);
    serializer.serializeToStream(outputStream);
    outputStream.close();

    inputStream = storageStream.newInputStream(0);

    uploadChannel.setUploadStream(inputStream,
                                  "text/calendar", -1);
    try {
        channel.asyncOpen(publishingListener, aProgressDialog);
    } catch (e) {
        var sbs = Components.classes["@mozilla.org/intl/stringbundle;1"]
                        .getService(Components.interfaces.nsIStringBundleService);
        var props = sbs.createBundle("chrome://calendar/locale/calendar.properties");
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                      .getService(Components.interfaces.nsIPromptService);
        promptService.alert(null, calGetString("calendar", "genericErrorTitle"),
                            props.formatStringFromName('otherPutError',[e.message],1));
    }
}


var notificationCallbacks =
{
    // nsIInterfaceRequestor interface
    getInterface: function(iid, instance) {
        if (iid.equals(Components.interfaces.nsIAuthPrompt)) {
            // use the window watcher service to get a nsIAuthPrompt impl
            var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                               .getService(Components.interfaces.nsIWindowWatcher);
            return ww.getNewAuthPrompter(null);
        }

        throw Components.results.NS_ERROR_NO_INTERFACE;
    }
}


var publishingListener =
{
    QueryInterface: function(aIId, instance)
    {
        if (aIId.equals(Components.interfaces.nsIStreamListener) ||
            aIId.equals(Components.interfaces.nsISupports))
            return this;

        throw Components.results.NS_ERROR_NO_INTERFACE;
    },

    onStartRequest: function(request, ctxt)
    {
    },

    onStopRequest: function(request, ctxt, status, errorMsg)
    {
        ctxt.wrappedJSObject.onStopUpload();

        let channel;
        let sbs = Components.classes["@mozilla.org/intl/stringbundle;1"]
                        .getService(Components.interfaces.nsIStringBundleService);
        let props = sbs.createBundle("chrome://calendar/locale/calendar.properties");
        let promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                      .getService(Components.interfaces.nsIPromptService);
        let requestSucceeded;
        try {
            channel = request.QueryInterface(Components.interfaces.nsIHttpChannel);
            requestSucceeded = channel.requestSucceeded;
        } catch(e) {
        }
        if (channel && !requestSucceeded) {
            promptService.alert(null, calGetString("calendar", "genericErrorTitle"),
                                props.formatStringFromName('httpPutError',[channel.responseStatus, channel.responseStatusText],2));
        } else if (!channel && !Components.isSuccessCode(request.status)) {
            // XXX this should be made human-readable.
            promptService.alert(null, calGetString("calendar", "genericErrorTitle"),
                                props.formatStringFromName('otherPutError',[request.status.toString(16)],1));
        }
    },

    onDataAvailable: function(request, ctxt, inStream, sourceOffset, count)
    {
    }
}

