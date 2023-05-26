"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
require("flatpickr/dist/flatpickr.min.css");
var core_1 = require("@fullcalendar/core");
var daygrid_1 = require("@fullcalendar/daygrid");
var list_1 = require("@fullcalendar/list");
var timegrid_1 = require("@fullcalendar/timegrid");
var flatpickr_1 = require("flatpickr");
var getEvents = function () {
    var scripts = document.querySelectorAll('[data-element="event-data"]');
    var scriptsArray = Array.from(scripts);
    var events = scriptsArray.reduce(function (acc, script) {
        if (script.textContent) {
            var eventData = JSON.parse(script.textContent);
            var event_1 = __assign(__assign({}, eventData), { start: new Date(eventData.start), end: new Date(eventData.end), session: parseInt(eventData.session, 10), id: eventData.id });
            acc.push(event_1);
        }
        return acc;
    }, []);
    return events;
};
var selectedSession = 1;
var userAvailabilities = {
    session1: [],
    session2: [],
};
function showCustomModal() {
    var customModal = document.getElementById('customModal');
    if (customModal) {
        customModal.style.display = 'block';
    }
    // Close the custom modal when the close button is clicked
    var closeModalButton = document.getElementById('closeModal');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', function () {
            if (customModal) {
                customModal.style.display = 'none';
            }
        });
    }
}
function eventClick(arg) {
    // eslint-disable-next-line no-console
    console.log('eventClick', arg.event.title);
    var selectedDate = new Date(arg.event.start);
    var modalId = document.querySelector('#eventModal .modal-id');
    if (modalId) {
        modalId.textContent = arg.event.id; // Display the event's ID
    }
    else {
        throw new Error('modalId not found');
    }
    var modalElement = document.querySelector('#eventModal');
    if (modalElement) {
        modalElement.style.display = 'block';
        // get the title of the selected event and set it as the titel for the modal
        var modalTitle = document.querySelector('#eventModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = arg.event.title;
        }
        else {
            throw new Error('modalTitle not found');
        }
        if (selectedSession === 1) {
            userAvailabilities.session1.push(selectedDate);
        }
        else {
            userAvailabilities.session2.push(selectedDate);
        }
    }
}
var updateCalendar = function (calendar, session) {
    var events = getEvents().filter(function (event) { return event.session === session; });
    calendar.getEventSources().forEach(function (source) { return source.remove(); });
    calendar.addEventSource(events);
};
// Create two separate Flatpickr instances
var preferredDatePicker1 = (0, flatpickr_1.default)('#Preferred-Date-1', {
    dateFormat: 'Y-m-d H:i',
    enableTime: true,
    time_24hr: true,
    mode: 'multiple',
    onChange: function (selectedDates) { return updateSelectedDatesList(selectedDates, 1); },
});
var preferredDatePicker2 = (0, flatpickr_1.default)('#Preferred-Date-2', {
    dateFormat: 'Y-m-d H:i',
    enableTime: true,
    time_24hr: true,
    mode: 'multiple',
    onChange: function (selectedDates) { return updateSelectedDatesList(selectedDates, 2); },
});
// Update the updateSelectedDatesList function to handle the session number
function updateSelectedDatesList(selectedDates, session) {
    var listElement = document.querySelector("#selected-dates-list-".concat(session));
    if (!listElement)
        return;
    listElement.innerHTML = ''; // Clear the list
    selectedDates.forEach(function (date, index) {
        var listItem = document.createElement('li');
        listItem.textContent = date.toLocaleString(); // Format the date and time
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete date';
        deleteButton.addEventListener('click', function () {
            // Remove the date from the selected dates array
            if (session === 1) {
                preferredDatePicker1.selectedDates.splice(index, 1);
                preferredDatePicker1.redraw();
            }
            else {
                preferredDatePicker2.selectedDates.splice(index, 1);
                preferredDatePicker2.redraw();
            }
            // Update the list
            updateSelectedDatesList(session === 1 ? preferredDatePicker1.selectedDates : preferredDatePicker2.selectedDates, session);
        });
        listItem.appendChild(deleteButton);
        listElement.appendChild(listItem);
    });
    // Show the list container
    var listContainer = document.querySelector("#selected-dates-list-".concat(session));
    if (listContainer) {
        listContainer.style.display = selectedDates.length ? 'block' : 'none';
    }
}
// Trigger the initial update for both lists
updateSelectedDatesList(preferredDatePicker1.selectedDates, 1);
updateSelectedDatesList(preferredDatePicker2.selectedDates, 2);
var form = document.getElementById('wf-form-custom_dates_form');
if (form) {
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Get the selected dates and times from Flatpickr
        var session1SelectedDates = preferredDatePicker1.selectedDates;
        var session2SelectedDates = preferredDatePicker2.selectedDates;
        // Convert the selected dates to an array of strings
        var session1SelectedDatesStrings = session1SelectedDates.map(function (date) { return date.toLocaleString(); });
        var session2SelectedDatesStrings = session2SelectedDates.map(function (date) { return date.toLocaleString(); });
        // Get the email input element
        var emailInput = document.getElementById('email_2');
        var email = emailInput.value;
        // Check if the email ends with the "@umontreal.ca"
        if (!email.endsWith('@umontreal.ca')) {
            var emailError_1 = document.getElementById('emailError');
            if (emailError_1) {
                emailError_1.style.display = 'block';
            }
            return;
        }
        var emailError = document.getElementById('emailError');
        if (emailError) {
            emailError.style.display = 'none';
        }
        // Add the selectedDatesStrings array to your userAvailabilities object
        var formElements = form.elements;
        var name = formElements.namedItem('name-2');
        var note = formElements.namedItem('note');
        var userAvailabilities = {
            name: name.value,
            email: email,
            session1: session1SelectedDatesStrings,
            session2: session2SelectedDatesStrings,
            note: note.value,
        };
        // Submit the userAvailabilities data here
        // eslint-disable-next-line no-console
        console.log(userAvailabilities);
        // Display the custom modal
        var customModal = document.getElementById('customModal');
        if (customModal) {
            customModal.style.display = 'block';
        }
        // Close the custom modal when the close button is clicked
        var closeModalButton = document.getElementById('closeModal');
        if (closeModalButton) {
            closeModalButton.addEventListener('click', function () {
                if (customModal) {
                    customModal.style.display = 'none';
                }
            });
        }
        // Clear the selected dates in Flatpickr and update the list
        preferredDatePicker1.clear();
        preferredDatePicker2.clear();
        updateSelectedDatesList([], 1);
        updateSelectedDatesList([], 2);
        // Call the showCustomModal function
        showCustomModal();
    });
}
window.Webflow = window.Webflow || { push: function (callback) { return callback(); } };
window.Webflow.push(function () {
    var calendarElement = document.querySelector('[data-element="calendar"]');
    if (!calendarElement)
        return;
    var events = getEvents();
    var sessionSelector = document.getElementById('session-selector');
    if (sessionSelector) {
        sessionSelector.addEventListener('change', function () {
            selectedSession = parseInt(sessionSelector.value, 10);
            updateCalendar(calendar, selectedSession);
        });
    }
    var calendar = new core_1.Calendar(calendarElement, {
        plugins: [daygrid_1.default, timegrid_1.default, list_1.default],
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listPlugin',
        },
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        },
        events: events,
        eventClick: eventClick,
    });
    calendar.render();
});
