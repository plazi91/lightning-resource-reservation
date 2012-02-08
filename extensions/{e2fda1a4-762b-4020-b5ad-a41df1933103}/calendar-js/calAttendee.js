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
 * The Original Code is Oracle Corporation code.
 *
 * The Initial Developer of the Original Code is
 *  Oracle Corporation
 * Portions created by the Initial Developer are Copyright (C) 2004
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Mike Shaver <shaver@off.net>
 *   Daniel Boelzle <daniel.boelzle@sun.com>
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

Components.utils.import("resource://calendar/modules/calIteratorUtils.jsm");

function calAttendee() {
    this.wrappedJSObject = this;
    this.mProperties = new calPropertyBag();
}

calAttendee.prototype = {
    getInterfaces: function (count) {
        var ifaces = [
            Components.interfaces.nsISupports,
            Components.interfaces.calIAttendee,
            Components.interfaces.nsIClassInfo
        ];
        count.value = ifaces.length;
        return ifaces;
    },

    getHelperForLanguage: function (language) {
        return null;
    },

    contractID: "@mozilla.org/calendar/attendee;1",
    classDescription: "Calendar Attendee",
    classID: Components.ID("{5c8dcaa3-170c-4a73-8142-d531156f664d}"),
    implementationLanguage: Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT,
    flags: 0,

    QueryInterface: function (aIID) {
        return cal.doQueryInterface(this, calAttendee.prototype, aIID, null, this);
    },

    mImmutable: false,
    get isMutable() { return !this.mImmutable; },

    modify: function() {
        if (this.mImmutable) {
            throw Components.results.NS_ERROR_OBJECT_IS_IMMUTABLE;
        }
    },

    makeImmutable : function() {
        this.mImmutable = true;
    },

    clone: function() {
        var a = new calAttendee();

        if (this.mIsOrganizer) {
            a.isOrganizer = true;
        }

        const allProps = ["id", "commonName", "rsvp", "role",
                          "participationStatus", "userType"];
        for each (let prop in allProps) {
            a[prop] = this[prop];
        }

        for each (let [key, value] in this.mProperties) {
            a.setProperty(key, value);
        }

        return a;
    },
    // XXX enforce legal values for our properties;

    icalAttendeePropMap: [
    { cal: "rsvp",                ics: "RSVP" },
    { cal: "commonName",          ics: "CN" },
    { cal: "participationStatus", ics: "PARTSTAT" },
    { cal: "userType",            ics: "CUTYPE" },
    { cal: "role",                ics: "ROLE" } ],

    mIsOrganizer: false,
    get isOrganizer() { return this.mIsOrganizer; },
    set isOrganizer(bool) { this.mIsOrganizer = bool; },

    // icalatt is a calIcalProperty of type attendee
    set icalProperty (icalatt) {
        this.modify();
        this.id = icalatt.valueAsIcalString;

        let promotedProps = { };
        for each (let prop in this.icalAttendeePropMap) {
            this[prop.cal] = icalatt.getParameter(prop.ics);
            // Don't copy these to the property bag.
            promotedProps[prop.ics] = true;
        }

        // Reset the property bag for the parameters, it will be re-initialized
        // from the ical property.
        this.mProperties = new calPropertyBag();

        for each (let [name, value] in cal.ical.paramIterator(icalatt)) {
            if (!promotedProps[name]) {
                this.setProperty(name, value);
            }
        }
    },

    get icalProperty() {
        var icssvc = cal.getIcsService();
        var icalatt;
        if (!this.mIsOrganizer) {
            icalatt = icssvc.createIcalProperty("ATTENDEE");
        } else {
            icalatt = icssvc.createIcalProperty("ORGANIZER");
        }

        if (!this.id) {
            throw Components.results.NS_ERROR_NOT_INITIALIZED;
        }
        icalatt.valueAsIcalString = this.id;
        for (var i = 0; i < this.icalAttendeePropMap.length; i++) {
            var prop = this.icalAttendeePropMap[i];
            if (this[prop.cal]) {
                try {
                    icalatt.setParameter(prop.ics, this[prop.cal]);
                } catch (e if e.result == Components.results.NS_ERROR_ILLEGAL_VALUE) {
                    // Illegal values should be ignored, but we could log them if
                    // the user has enabled logging.
                    cal.LOG("Warning: Invalid attendee parameter value " + prop.ics + "=" + this[prop.cal]);
                }
            }
        }
        for each (let [key, value] in this.mProperties) {
            try {
                icalatt.setParameter(key, value);
            } catch (e if e.result == Components.results.NS_ERROR_ILLEGAL_VALUE) {
                // Illegal values should be ignored, but we could log them if
                // the user has enabled logging.
                cal.LOG("Warning: Invalid attendee parameter value " + key + "=" + value);
            }
        }
        return icalatt;
    },

    get propertyEnumerator() { return this.mProperties.enumerator; },

    // The has/get/set/deleteProperty methods are case-insensitive.
    getProperty: function (aName) {
        return this.mProperties.getProperty(aName.toUpperCase());
    },
    setProperty: function (aName, aValue) {
        this.modify();
        if (aValue || !isNaN(parseInt(aValue, 10))) {
            this.mProperties.setProperty(aName.toUpperCase(), aValue);
        } else {
            this.mProperties.deleteProperty(aName.toUpperCase());
        }
    },
    deleteProperty: function (aName) {
        this.modify();
        this.mProperties.deleteProperty(aName.toUpperCase());
    },

    get id() {
        return this.mId;
    },
    set id(aId) {
        this.modify();
        // RFC 1738 para 2.1 says we should be using lowercase mailto: urls
        return (this.mId = (aId ? aId.replace(/^mailto:/i, "mailto:") : null));
    },

    toString: function calAttendee_toString() {
        var ret = (this.id || "unknown").replace(/^mailto:/i, "");
        var cn = this.commonName;
        if (cn) {
            ret = (cn + " <" + ret + ">");
        }
        return ret;
    }
};

var makeMemberAttr;
if (makeMemberAttr) {
    makeMemberAttr(calAttendee, "mCommonName", null, "commonName");
    makeMemberAttr(calAttendee, "mRsvp", null, "rsvp");
    makeMemberAttr(calAttendee, "mRole", null, "role");
    makeMemberAttr(calAttendee, "mParticipationStatus", "NEEDS-ACTION",
                   "participationStatus");
    makeMemberAttr(calAttendee, "mUserType", "INDIVIDUAL", "userType");
}
