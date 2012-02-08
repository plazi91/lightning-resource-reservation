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
 *   Matthew Mecca <matthew.mecca@gmail.com>
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

/**
 * This object gives you the possibility to filter items for its properties.
 * It has the following properties:
 *
 *
 * private Attributes:
 *  mStartDate
 *  mEndDate            - the limits for the item to be in the filter
 *  mPropertyFilter     - a boolean function to filter items in a costumized way
 *  mPropertyFilterBag  - an object with a number of predefined filterFunctions
 *  mTextFilterField    - the id of a text - field that is associated with the filter
 *
 *  setting up the dateFilter:
 *  setDateFilter       - this function takes a string and sets the start and endDate of
 *                        the filter by using the getDatesForFilter function, please look
 *                        on the documentation for this function for further informations
 *
 * setting up the propertyFilter:
 *  you can associate a textFilter, a built-in filter or a custom function with the 
 *  propertyFilter. It is always set up by using calFilter.propertyFilter = aFilter
 *    1.) Use a built-in filter:
 *        - aFilter is a string 
 *        - the string has to be the name of one of the members of mPropertyFilterBag
 *        the propertyFilter is set to this built-in function
 *    2.) Use a text filter:
 *        - aFilter is a string
 *        - the string is a id of a text-field
 *        the propertyFilter will always filter out by regular expression items whose
 *        properties contain the value of the text-field
 *    3.) Use a costumized filter:
 *        - aFilter is a function
 *        propertyFilter is set this function
 * 
 * using the filter:
 * isItemInFilters        - this takes an item and returns the result of
 *                          checkIfInRange and propertyFilter
 */

function calFilter() {
  this.wrappedJSObject = this;
}

calFilter.prototype = {
    mStartDate: null,
    mEndDate: null,
    mTextFilterField: null,
    mPropertyFilter: filterAll,
    mSelectedDate: null,

    // a number of prefined Filters for properties
    mPropertyFilterBag: { 
        all: filterAll,
        notstarted: function cF_filterNotStarted(item) {
            return !item.isCompleted &&
                   (percentCompleted(item) <= 0);
        },
        overdue: function cF_filterOverdue(item) {
            // in case the item has no due date
            // it can't be overdue by definition
            if (item.dueDate == null) {
                return false;
            }
            return !item.isCompleted &&
                   !(item.dueDate.compare(now()) > 0);
        },
        open: function cF_filterOpen(item) {
            return !item.isCompleted;
        },
        completed: function cF_filterCompleted(item) {
            return item.isCompleted;
        },
        repeating: function cF_filterRepeating(item) {
            return (item.recurrenceInfo != null);
        },
        throughcurrent: function cF_filterThroughCurrent(item) {
            if (!item.completedDate) {
                return true;
            }
            // filter out tasks completed earlier than today
            let today = cal.now();
            today.isDate = true;

            return (today.compare(item.completedDate) <= 0);
        }
    },

    get startDate() {
        return this.mStartDate;
    },

    set startDate(aStartDate) {
        return (this.mStartDate = aStartDate);
    },

    get endDate() {
        return this.mEndDate;
    },

    set endDate(aEndDate) {
        return (this.mEndDate = aEndDate);
    },

    set textFilterField(aId) {
        return (this.mTextFilterField = aId);
    },

    get textFilterField() {
        return this.mTextFilterField;
    },

    get selectedDate() {
        return this.mSelectedDate;
    },

    set selectedDate(aSelectedDate) {
        return (this.mSelectedDate = aSelectedDate);
    },

    // checks if the item contains the text of mTextFilterField
    textFilter: function cF_filterByText(aItem) {
        filterByText.mTextFilterField = this.mTextFilterField;
        var inIt = filterByText(aItem);
        return inIt;
    },

    get propertyFilter() {
        if(!this.mPropertyFilter) {
            this.mPropertyFilter = filterAll;
        }

        return this.mPropertyFilter;
    },

    /*
     * @param aFilter if -  aFilter is a string, propertyFilter is textFilter
     *                      if aFilter has to be the id of the textFilterField then
     *                      if aFilter is the number of a number of predefined 
     *                          propertyFilters, propertyFilters is set to be this
     *                   -  aFilter is a function, the propertyFilter is set to be this
     *                      function
     */
    set propertyFilter(aFilter) {
        if (typeof(aFilter) == "string") {
            // check if it is one of the build in filters
            if (this.mPropertyFilterBag[aFilter]) {
                return (this.mPropertyFilter = this.mPropertyFilterBag[aFilter]);
            }
            // check if the aFilter is the id of an item, otherwise 
            // return set the filter to all
            if (document.getElementById(aFilter)) {
                this.mTextFilterField = aFilter;
                return (this.mPropertyFilter = this.textFilter);
            }
        } else if (typeof(aFilter) == "function") {
          return (this.mPropertyFilter = aFilter);
        }  
        
        return (this.mPropertyFilter = filterAll);
    },

    // set's the startDate and the endDate by using getDatesForFilter 
    setDateFilter: function cF_setDateFilter(aFilter) {
      var [startDate, endDate] = getDatesForFilter(aFilter, this.mSelectedDate);
      this.mStartDate = startDate;
      this.mEndDate = endDate;
      return [this.mStartdate, this.mEndDate];
    },

    // checks if the item is between startDate and endDate
    isItemWithinRange: function cF_isDateWithinRange(aItem) {
        return checkIfInRange(aItem, this.mStartDate, this.mEndDate);
    },

    // checks if the item is between startDate and endDate and its properties
    isItemInFilters: function cF_isItemInFilters(aItem) {
        return (this.isItemWithinRange(aItem) && this.propertyFilter(aItem));
    }
};

/**
 * @param aFilter         a String describing the filter, it should met a regEx to call 
 *                        duration from filter otherwise a costumized filter is called
 * @param aSelectedDate   Optional - the selected date to use for filters that require it.
 *                        The selected day of the current view will be used by default.
 * @return        [startDate, endDate]
 */

function getDatesForFilter(aFilter, aSelectedDate) {
    let endDate = cal.createDateTime();
    let startDate = cal.createDateTime();
    let duration = cal.createDuration();
    let oneDay = cal.createDuration();
    oneDay.days = 1;
    let selectedDate = aSelectedDate || currentView().selectedDay;

    let durFilterReg = /next|last\d+\D+$/
    if (durFilterReg.exec(aFilter)) {
        duration =  durationFromFilter(aFilter);
        if (!duration) {
            endDate = null;
            startDate = null;
        } else {
            startDate = cal.now();
            endDate = cal.now();
            endDate.addDuration(duration);
        }
    } else {
      switch (aFilter) {
        case "all":
            startDate = null;
            endDate = null;
            break;

        case "today":
            startDate = cal.now();
            startDate.isDate = true;
            endDate = cal.now();
            endDate.isDate = true;
            endDate.addDuration(oneDay);
            break;

        case "thisCalendarMonth":
            startDate = cal.now().startOfMonth;
            endDate = cal.now().endOfMonth;
            endDate.addDuration(oneDay);
            break;

        case "future":
            startDate = cal.now();
            endDate = null;
            break;

        case "current":
            startDate = selectedDate ? selectedDate.clone() : cal.now();
            startDate.isDate = true;
            endDate = startDate.clone();
            endDate.addDuration(oneDay);
            break;

        case "throughcurrent":
        case "open":
        case "overdue":
        case "completed":
        case "notstarted":
            // use the later of the current date or the selected date of the current view
            endDate = selectedDate ? selectedDate.clone() : cal.now();
            if (endDate.jsDate < cal.now().jsDate) {
                endDate = cal.now();
            }
            endDate.isDate = true;
            endDate.addDuration(oneDay);
            break;

        default:
            startDate = null;
            endDate = null;
            break;
      }
    }
    return [startDate, endDate];
}

/**
 * Functions to create a duration based on a filter string.
 * 
 * @param aFilter the filter string, it has has to match the pattern
 *                [last|next] Period [UnitOfThePeriod]
 * @return        the duration or null
 */
function durationFromFilter(aFilter) {
  var durReg = /(last|next)/
  var periodReg = /(\d+)/
  var unitReg = /\d+(\D+)$/
  try {
    // Create the direction of the duration
    var modifier = (durReg.exec(aFilter)[1] == "next") ? 1 : -1;

    // Get the numerical value
    var period = periodReg.exec(aFilter)[1];

    //Get the unit
    var duration = createDuration();
    switch( unitReg.exec(aFilter)[1]) {
      case "weeks":
        duration.weeks = modifier*period;
        break;
      case "days":
        duration.days = modifier*period;
        break;
      case "hours":
        duration.hours = modifier*period;
        break;
      default:
        return null;
    }
    return duration;
  } catch(e) {
    dump(e);
    return null;
  }
}

/**
 * @param aItem             Is a normal calIItemBase
 * @param mTextFilterField  Has to be set from the outside of the function
 * @return                  Filters if the item is contains the searchText
 */
function filterByText(aItem) {
    var searchText = document.getElementById(filterByText.mTextFilterField)
                             .value.toLowerCase();

    if (!searchText.length || searchText.match(/^\s*$/)) {
        return true;
    }

    const fieldsToSearch = ["SUMMARY", "DESCRIPTION", "LOCATION", "URL"];

    for each (var field in fieldsToSearch) {
        var val = aItem.getProperty(field);
        if (val && val.toLowerCase().indexOf(searchText) != -1) {
            return true;
        }
    }

    return aItem.getCategories({}).some(
        function someFunc(cat) {
            return (cat.toLowerCase().indexOf(searchText) != -1);
        });
}

function percentCompleted(item) {
    var percent = 0;
    var property = item.getProperty("PERCENT-COMPLETE");
    if (property != null) {
        var percent = parseInt(property);
    }
    return percent;
} 

function filterAll(aItem) {
    return true;
}

