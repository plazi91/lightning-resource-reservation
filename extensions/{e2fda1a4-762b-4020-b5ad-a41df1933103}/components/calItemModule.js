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
 * The Original Code is Mozilla Calendar code.
 *
 * The Initial Developer of the Original Code is
 *   Philipp Kewisch <mozilla@kewis.ch>
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Daniel Boelzle <dbo.moz@boelzle.org>
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
Components.utils.import("resource://gre/modules/Services.jsm");

const scriptLoadOrder = [
    "calItemBase.js",
    "calUtils.js",
    "calCachedCalendar.js",

    "calAlarm.js",
    "calAlarmService.js",
    "calAlarmMonitor.js",
    "calAttendee.js",
    "calAttachment.js",
    "calCalendarManager.js",
    "calCalendarSearchService.js",
    "calDateTimeFormatter.js",
    "calEvent.js",
    "calFreeBusyService.js",
    "calIcsParser.js",
    "calIcsSerializer.js",
    "calItipItem.js",
    "calProtocolHandler.js",
    "calRecurrenceInfo.js",
    "calRelation.js",
    "calStartupService.js",
    "calTransactionManager.js",
    "calTodo.js",
    "calWeekInfoService.js"
];

function NSGetFactory(cid) {
    if (!this.scriptsLoaded) {
        Services.io.getProtocolHandler("resource")
                .QueryInterface(Components.interfaces.nsIResProtocolHandler)
                .setSubstitution("calendar", Services.io.newFileURI(__LOCATION__.parent.parent));
        Components.utils.import("resource://calendar/modules/calUtils.jsm");
        cal.loadScripts(scriptLoadOrder, Components.utils.getGlobalForObject(this));
        this.scriptsLoaded = true;
    }

    let components = [
        calAlarm,
        calAlarmService,
        calAlarmMonitor,
        calAttendee,
        calAttachment,
        calCalendarManager,
        calCalendarSearchService,
        calDateTimeFormatter,
        calEvent,
        calFreeBusyService,
        calIcsParser,
        calIcsSerializer,
        calItipItem,
        calProtocolHandlerWebcal,
        calProtocolHandlerWebcals,
        calRecurrenceInfo,
        calRelation,
        calStartupService,
        calTransaction,
        calTransactionManager,
        calTodo,
        calWeekInfoService,
    ];

    return (XPCOMUtils.generateNSGetFactory(components))(cid);
}
