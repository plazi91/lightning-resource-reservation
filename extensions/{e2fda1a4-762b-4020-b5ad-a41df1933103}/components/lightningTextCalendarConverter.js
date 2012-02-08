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
 * The Original Code is Lightning code.
 *
 * The Initial Developer of the Original Code is Oracle Corporation
 * Portions created by the Initial Developer are Copyright (C) 2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Mike Shaver <shaver@mozilla.org>
 *   Clint Talbert <ctalbert.moz@gmail.com>
 *   Matthew Willis <lilmatt@mozilla.com>
 *   Mauro Cicognini <mcicogni@libero.it>
 *   Philipp Kewisch <mozilla@kewis.ch>
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

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://calendar/modules/calUtils.jsm");

function makeTableRow(val) {
    return "<tr><td>" + val[0] + "</td><td>" + val[1] + "</td></tr>\n";
}

function getLightningStringBundle()
{
    var svc = Components.classes["@mozilla.org/intl/stringbundle;1"].
              getService(Components.interfaces.nsIStringBundleService);
    return svc.createBundle("chrome://lightning/locale/lightning.properties");
}

function linkifyText(text) {
    // Save off the settings
    var savedSettings = XML.settings();

    XML.ignoreWhitespace = false;
    XML.prettyPrinting = false;
    XML.prettyIndent = false;
    var linkifiedText = <p/>;
    var localText = text;

    // XXX This should be improved to also understand abbreviated urls, could be
    // extended to only linkify urls that have an internal protocol handler, or
    // have an external protocol handler that has an app assigned. The same
    // could be done for mailto links which are not handled here either.

    while (localText.length) {
        var pos = localText.search(/(^|\s+)([a-zA-Z0-9]+):\/\/[^\s]+/);
        if (pos == -1) {
            linkifiedText.appendChild(localText);
            break;
        }
        pos += localText.substr(pos).match(/^\s*/)[0].length;
        var endPos = pos + localText.substr(pos).search(/([.!,<>(){}]+)?(\s+|$)/);
        var url = localText.substr(pos, endPos - pos);

        if (pos > 0) {
            linkifiedText.appendChild(localText.substr(0, pos));
        }
        var a = <a>{url}</a>;
        a.@href = url;

        linkifiedText.appendChild(a);

        localText = localText.substr(endPos);
    }
    // restore the settings
    XML.setSettings(savedSettings);

    return linkifiedText;
}

function createHtmlTableSection(label, text, linkify)
{
    var tblRow = <tr>
                    <td class="description">
                        <p>{label}</p>
                    </td>
                    <td class="content">
                        <p/>
                    </td>
                 </tr>;
    if (linkify) {
        tblRow.td.(@class == "content").p = linkifyText(text);
    } else {
        tblRow.td.(@class == "content").p = text;
    }
    return tblRow;
}

function createHtml(event)
{
    // Creates HTML using the Node strings in the properties file
    var stringBundle = getLightningStringBundle();
    var html;
    if (stringBundle) {
        // Using e4x javascript support here
        html =
               <html>
               <head>
                    <meta http-equiv='Content-Type' content='text/html; charset=utf-8'/>
                    <link rel='stylesheet' type='text/css' href='chrome://messagebody/skin/imip.css'/>
               </head>
               <body>
                    <table>
                    </table>
               </body>
               </html>;
        // Create header row
        var labelText = stringBundle.GetStringFromName("imipHtml.header");
        html.body.table.appendChild(
            <tr>
                <td colspan="3" class="header">
                    <p class="header">{labelText}</p>
                </td>
            </tr>
        );
        if (event.title) {
            labelText = stringBundle.GetStringFromName("imipHtml.summary");
            html.body.table.appendChild(createHtmlTableSection(labelText,
                                                               event.title));
        }

        var eventLocation = event.getProperty("LOCATION");
        if (eventLocation) {
            labelText = stringBundle.GetStringFromName("imipHtml.location");
            html.body.table.appendChild(createHtmlTableSection(labelText,
                                                               eventLocation));
        }

        var dateString = cal.getDateFormatter().formatItemInterval(event);
        var labelText = stringBundle.GetStringFromName("imipHtml.when");
        html.body.table.appendChild(createHtmlTableSection(labelText,
                                                           dateString));

        if (event.organizer &&
            (event.organizer.commonName || event.organizer.id))
        {
            labelText = stringBundle.GetStringFromName("imipHtml.organizer");
            // Trim any instances of "mailto:" for better readibility.
            var orgname = event.organizer.commonName ||
                          event.organizer.id.replace(/mailto:/ig, "");
            html.body.table.appendChild(createHtmlTableSection(labelText, orgname));
        }

        var eventDescription = event.getProperty("DESCRIPTION");
        if (eventDescription) {
            // Remove the useless "Outlookism" squiggle.
            var desc = eventDescription.replace("*~*~*~*~*~*~*~*~*~*", "");

            labelText = stringBundle.GetStringFromName("imipHtml.description");
            html.body.table.appendChild(createHtmlTableSection(labelText, desc, true));
        }

        var eventComment = event.getProperty("COMMENT");
        if (eventComment) {
            labelText = stringBundle.GetStringFromName("imipHtml.comment");
            html.body.table.appendChild(createHtmlTableSection(labelText,eventComment, true));
        }
    }

    return html;
}

function ltnMimeConverter() { }

ltnMimeConverter.prototype = {
    classID: Components.ID("{c70acb08-464e-4e55-899d-b2c84c5409fa}"),
    contractID: "@mozilla.org/lightning/mime-converter;1",
    classDescription: "Lightning text/calendar handler",

    getInterfaces: function getInterfaces(count) {
        const ifaces = [Components.interfaces.nsISimpleMimeConverter,
                        Components.interfaces.nsIClassInfo,
                        Components.interfaces.nsISupports];
        count.value = ifaces.length;
        return ifaces;
    },
    getHelperForLanguage: function getHelperForLanguage(language) {
        return null;
    },
    implementationLanguage: Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT,
    flags: 0,

    QueryInterface: function QI(aIID) {
        return cal.doQueryInterface(this, ltnMimeConverter.prototype, aIID, null, this);
    },

    mUri: null,
    get uri() {
        return this.mUri;
    },
    set uri(aUri) {
        return (this.mUri = aUri);
    },

    convertToHTML: function lmcCTH(contentType, data) {
        let parser = Components.classes["@mozilla.org/calendar/ics-parser;1"]
                               .createInstance(Components.interfaces.calIIcsParser);
        parser.parseString(data);
        let event = null;
        for each (var item in parser.getItems({})) {
            if (cal.isEvent(item)) {
                if (item.hasProperty("X-MOZ-FAKED-MASTER")) {
                    // if it's a faked master, take any overridden item to get a real occurrence:
                    let exc = item.recurrenceInfo.getExceptionFor(item.startDate);
                    cal.ASSERT(exc, "unexpected!");
                    if (exc) {
                        item = exc;
                    }
                }
                event = item;
                break;
            }
        }
        if (!event) {
            return;
        }
        let html = createHtml(event);

        try {
            // this.mUri is the message URL that we are processing.
            // We use it to get the nsMsgHeaderSink to store the calItipItem.
            if (this.mUri) {
                let msgWindow = null;
                try {
                    let msgUrl = this.mUri.QueryInterface(Components.interfaces.nsIMsgMailNewsUrl);
                    // msgWindow is optional in some scenarios
                    // (e.g. gloda in action, throws NS_ERROR_INVALID_POINTER then)
                    msgWindow = msgUrl.msgWindow;
                } catch (exc) {
                }
                if (msgWindow) {
                    let itipItem = Components.classes["@mozilla.org/calendar/itip-item;1"]
                                             .createInstance(Components.interfaces.calIItipItem);
                    itipItem.init(data);

                    let sinkProps = msgWindow.msgHeaderSink.properties;
                    sinkProps.setPropertyAsInterface("itipItem", itipItem);
            
                    // Notify the observer that the itipItem is available
                    let observer = Components.classes["@mozilla.org/observer-service;1"]
                                             .getService(Components.interfaces.nsIObserverService);
                    observer.notifyObservers(null, "onItipItemCreation", 0);
                }
            }
        } catch (e) {
            Components.utils.reportError("[ltnMimeConverter] convertToHTML: " + e);
        }

        return html;
    }
};

var NSGetFactory = XPCOMUtils.generateNSGetFactory([ltnMimeConverter]);
