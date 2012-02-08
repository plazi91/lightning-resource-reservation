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
 *   Fred Jendrzejewski <fred.jen@web.de>
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
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
Components.utils.import("resource://calendar/modules/calUtils.jsm");

/**
 * calRelation prototype definition
 *
 * @implements calIRelation
 * @constructor
 */
function calRelation() {
    this.wrappedJSObject = this;
    this.mProperties = new calPropertyBag();
}

calRelation.prototype = {
    mType: null,
    mId: null,

    /**
     * @see nsISupports
     */
    QueryInterface: function (aIID) {
        return doQueryInterface(this,
                                calRelation.prototype,
                                aIID,
                                null,
                                this);
    },

    /**
     * @see nsIClassInfo
     */
    getInterfaces: function cR_getInterfaces(aCount) {
        let ifaces = [
            Components.interfaces.nsISupports,
            Components.interfaces.calIRelation,
            Components.interfaces.nsIClassInfo
        ];
        aCount.value = ifaces.length;
        return ifaces;
    },

    getHelperForLanguage: function cR_getHelperForLanguage(language) {
        return null;
    },

    contractID: "@mozilla.org/calendar/relation;1",
    classDescription: "Calendar Item Relation",
    classID: Components.ID("{76810fae-abad-4019-917a-08e95d5bbd68}"),
    implementationLanguage: Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT,
    flags: 0,

    /**
     * @see calIRelation
     */

    get relType() {
        return this.mType;
    },
    set relType(aType) {
        return (this.mType = aType);
    },

    get relId() {
        return this.mId;
    },
    set relId(aRelId) {
        return (this.mId = aRelId);
    },

    get icalProperty() {
        let icssvc = getIcsService();
        let icalatt = icssvc.createIcalProperty("RELATED-TO");
        if (this.mId) {
            icalatt.value = this.mId;
        }

        if (this.mType) {
            icalatt.setParameter("RELTYPE", this.mType);
        }

        for each (let [key, value] in this.mProperties) {
            try {
                icalatt.setParameter(key, value);
            } catch (e if e.result == Components.results.NS_ERROR_ILLEGAL_VALUE) {
                // Illegal values should be ignored, but we could log them if
                // the user has enabled logging.
                cal.LOG("Warning: Invalid relation property value " + key + "=" + value);
            }
        }
        return icalatt;
    },

    set icalProperty(attProp) {
        // Reset the property bag for the parameters, it will be re-initialized
        // from the ical property.
        this.mProperties = new calPropertyBag();

        if (attProp.value) {
            this.mId = attProp.value;
        }
        for each (let [name, value] in cal.ical.paramIterator(attProp)) {
            if (name == "RELTYPE") {
                this.mType = value;
                continue;
            }

            this.setParameter(name, value);
        }
    },

    getParameter: function (aName) {
        return this.mProperties.getProperty(aName);
    },

    setParameter: function (aName, aValue) {
        return this.mProperties.setProperty(aName, aValue);
    },

    deleteParameter: function (aName) {
        return this.mProperties.deleteProperty(aName);
    },

    clone: function cR_clone() {
        let newRelation = new calRelation();
        newRelation.mId = this.mId;
        newRelation.mType = this.mType;
        for each (let [name, value] in this.mProperties) {
            newRelation.mProperties.setProperty(name, value);
        }
        return newRelation;
    }
};
