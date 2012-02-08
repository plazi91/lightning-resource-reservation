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
 * The Original Code is Lightning preferences code.
 *
 * The Initial Developer of the Original Code is 
 *   Joey Minta <jminta@gmail.com>
 * Portions created by the Initial Developer are Copyright (C) 2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Stefan Sitter <ssitter@googlemail.com>
 *   Philipp Kewisch <mozilla@kewis.ch>
 *   Daniel Boelzle <daniel.boelzle@sun.com>
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

// This file contains all of the default preference values for Lightning

// Turns on basic calendar logging.
pref("calendar.debug.log", false);
// Turns on verbose calendar logging.
pref("calendar.debug.log.verbose", false);

// addon description
pref("extensions.{e2fda1a4-762b-4020-b5ad-a41df1933103}.description",
     "chrome://lightning/locale/lightning.properties");
pref("extensions.{e2fda1a4-762b-4020-b5ad-a41df1933103}.name",
     "chrome://lightning/locale/lightning.properties");
pref("extensions.{e2fda1a4-762b-4020-b5ad-a41df1933103}.creator",
     "chrome://lightning/locale/lightning.properties");

// general settings
pref("calendar.date.format", 0);
pref("calendar.event.defaultlength", 60);

// default transparency of allday items; could be switched to e.g. "OPAQUE":
pref("calendar.allday.defaultTransparency", "TRANSPARENT");

// number of days in "Soon" section
pref("calendar.agendaListbox.soondays", 5);

// alarm settings
pref("calendar.alarms.show", true);
pref("calendar.alarms.showmissed", true);
pref("calendar.alarms.playsound", true);
pref("calendar.alarms.soundURL", "chrome://calendar/content/sound.wav");
pref("calendar.alarms.defaultsnoozelength", 5);
pref("calendar.alarms.indicator.show", true);
pref("calendar.alarms.indicator.totaltime", 3600);

// default alarm settings for new event
pref("calendar.alarms.onforevents", 0);
pref("calendar.alarms.eventalarmlen", 15);
pref("calendar.alarms.eventalarmunit", "minutes");

// default alarm settings for new task
pref("calendar.alarms.onfortodos", 0);
pref("calendar.alarms.todoalarmlen", 15);
pref("calendar.alarms.todoalarmunit", "minutes");

// open invitations autorefresh settings
pref("calendar.invitations.autorefresh.enabled", true);
pref("calendar.invitations.autorefresh.timeout", 3);

// iTIP compatibility send mode
// 0 -- Outlook 2003 and following with text/plain and application/ics (default)
// 1 -- all Outlook, but no text/plain nor application/ics
// We may extend the compat mode if necessary.
pref("calendar.itip.compatSendMode", 0);

// whether "notify" is checked by default when creating new events/todos with attendees
pref("calendar.itip.notify", true);

// whether the organizer propagates replies of attendees to all attendees
pref("calendar.itip.notify-replies", false);

// whether CalDAV (experimental) scheduling is enabled or not.
pref("calendar.caldav.sched.enabled", false);

// 0=Sunday, 1=Monday, 2=Tuesday, etc.  One day we might want to move this to
// a locale specific file.
pref("calendar.week.start", 0);
pref("calendar.weeks.inview", 4);
pref("calendar.previousweeks.inview", 0);

// Default days off
pref("calendar.week.d0sundaysoff", true);
pref("calendar.week.d1mondaysoff", false);
pref("calendar.week.d2tuesdaysoff", false);
pref("calendar.week.d3wednesdaysoff", false);
pref("calendar.week.d4thursdaysoff", false);
pref("calendar.week.d5fridaysoff", false);
pref("calendar.week.d6saturdaysoff", true);

// start and end work hour for day and week views
pref("calendar.view.daystarthour", 8);
pref("calendar.view.dayendhour", 17);

// number of visible hours for day and week views
pref("calendar.view.visiblehours", 9);

// If true, mouse scrolling via shift+wheel will be enabled
pref("calendar.view.mousescroll", true);

// Do not set this!  If it's not there, then we guess the system timezone
//pref("calendar.timezone.local", "");

// categories settings
// XXX One day we might want to move this to a locale specific file
//     and include a list of locale specific default categories
pref("calendar.categories.names", "");

// Make sure mouse wheel shift and no key actions to scroll lines.
pref("mousewheel.withnokey.action", 0);
pref("mousewheel.withshiftkey.action", 0);

// Disable use of worker threads. Restart needed.
pref("calendar.threading.disabled", false);

// Enable support for multiple realms on one server with the payoff that you
// will get multiple password dialogs (one for each calendar)
pref("calendar.network.multirealm", false);

// Set up user agent
pref("calendar.useragent.extra", "Lightning/1.1.1");
