import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import flatpickr from 'flatpickr';
const getEvents = () => {
    const scripts = document.querySelectorAll('[data-element="event-data"]');
    const scriptsArray = Array.from(scripts);
    const events = scriptsArray.reduce((acc, script) => {
        if (script.textContent) {
            const eventData = JSON.parse(script.textContent);
            const event = {
                ...eventData,
                start: new Date(eventData.start),
                end: new Date(eventData.end),
                session: parseInt(eventData.session, 10),
                id: eventData.id,
            };
            acc.push(event);
        }
        return acc;
    }, []);
    return events;
};
let selectedDate = null;
function showCustomModal() {
    const customModal = document.getElementById('customModal');
    if (customModal) {
        customModal.style.display = 'block';
    }
    const closeModalButton = document.getElementById('closeModal');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            if (customModal) {
                customModal.style.display = 'none';
            }
        });
    }
}
function eventClick(arg) {
    console.log('eventClick', arg.event.title);
    const modalStartTime = document.querySelector('#eventModal #modal-start-time');
    const modalEndTime = document.querySelector('#eventModal #modal-end-time');
    const modalLocation = document.querySelector('#eventModal #modal-location');
    if (modalStartTime && modalEndTime && modalLocation) {
        if (arg.event.start) {
            const startTime = new Date(arg.event.start);
            modalStartTime.textContent = `Start time: ${startTime.toLocaleString()}`;
        }
        else {
            modalStartTime.textContent = 'Start time: Not specified';
        }
        if (arg.event.end) {
            const endTime = new Date(arg.event.end);
            modalEndTime.textContent = `End time: ${endTime.toLocaleString()}`;
        }
        else {
            modalEndTime.textContent = 'End time: Not specified';
        }
        const location = arg.event.extendedProps?.location;
        if (location) {
            modalLocation.textContent = `Location: ${location}`;
            modalLocation.style.display = 'block';
        }
        else {
            modalLocation.textContent = 'Location: Not specified';
            modalLocation.style.display = 'none';
        }
    }
    else {
        throw new Error('modal start time, end time, or location elements not found');
    }
    const modalElement = document.querySelector('.modal');
    if (modalElement) {
        modalElement.style.display = 'block';
        const modalTitle = document.querySelector('#eventModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = arg.event.title;
        }
        else {
            throw new Error('modalTitle not found');
        }
    }
}
const updateCalendar = (calendar) => {
    const events = getEvents();
    calendar.getEventSources().forEach((source) => source.remove());
    calendar.addEventSource(events);
};
const preferredDatePicker = flatpickr('#Preferred-Date', {
    dateFormat: 'Y-m-d H:i',
    enableTime: true,
    time_24hr: true,
    onChange: (selectedDates) => {
        selectedDate = selectedDates[0];
    },
});
const form = document.getElementById('wf-form-custom_dates_form');
if (form) {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const selectedDateStr = selectedDate?.toLocaleString();
        const emailInput = document.getElementById('email_2');
        const email = emailInput.value;
        if (!email.endsWith('@umontreal.ca')) {
            const emailError = document.getElementById('emailError');
            if (emailError) {
                emailError.style.display = 'block';
            }
            return;
        }
        const emailError = document.getElementById('emailError');
        if (emailError) {
            emailError.style.display = 'none';
        }
        const formElements = form.elements;
        const name = formElements.namedItem('name-2');
        const note = formElements.namedItem('note');
        const userAvailabilities = {
            name: name.value,
            email: email,
            selectedDate: selectedDateStr,
            note: note.value,
        };
        console.log(userAvailabilities);
        const customModal = document.getElementById('customModal');
        if (customModal) {
            customModal.style.display = 'block';
            const successMessage = document.getElementById('success-message');
            if (successMessage) {
                const successMessageContent = successMessage.querySelector('div');
                if (successMessageContent) {
                    successMessageContent.textContent = `MERCI! Votre demande a été reçue! La date sélectionnée est : ${selectedDateStr}`;
                }
            }
        }
        const closeModalButton = document.getElementById('closeModal');
        if (closeModalButton) {
            closeModalButton.addEventListener('click', () => {
                if (customModal) {
                    customModal.style.display = 'none';
                }
            });
        }
        preferredDatePicker.clear();
        showCustomModal();
    });
}
window.Webflow = window.Webflow || { push: (callback) => callback() };
window.Webflow.push(() => {
    const calendarElement = document.querySelector('[data-element="calendar"]');
    if (!calendarElement)
        return;
    const events = getEvents();
    const calendar = new Calendar(calendarElement, {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
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
        events,
        eventClick,
    });
    calendar.render();
});
