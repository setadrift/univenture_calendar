import 'flatpickr/dist/flatpickr.min.css';

import { Calendar, type EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import flatpickr from 'flatpickr';

import type { Event } from './types';

const getEvents = (): Event[] => {
  const scripts = document.querySelectorAll<HTMLScriptElement>('[data-element="event-data"]');
  const scriptsArray = Array.from(scripts);
  
  const events = scriptsArray.reduce((acc, script) => {
    if (script.textContent) {
      const eventData = JSON.parse(script.textContent);
      const event: Event = {
        ...eventData,
        start: new Date(eventData.start),
        end: new Date(eventData.end),
        session: parseInt(eventData.session, 10), // parse the session number as an integer
        id: eventData.id,
      };
      acc.push(event);
    }
    return acc;
  }, [] as Event[]);

  return events;
};

let selectedDate: Date | null = null;

function showCustomModal() {
  const customModal = document.getElementById('customModal');
  if (customModal) {
    customModal.style.display = 'block';
  }

  // Close the custom modal when the close button is clicked
  const closeModalButton = document.getElementById('closeModal');
  if (closeModalButton) {
    closeModalButton.addEventListener('click', () => {
      if (customModal) {
        customModal.style.display = 'none';
      }
    });
  }
}

function eventClick(arg: EventClickArg) {
  console.log('eventClick', arg.event.title);
  
  const modalId = document.querySelector('#eventModal .modal-id') as HTMLElement;
  if (modalId) {
    modalId.textContent = arg.event.id; // Display the event's ID
  } else {
    throw new Error('modalId not found');
  }

  const modalStartTime = document.querySelector('#eventModal .modal-start-time') as HTMLElement;
  const modalEndTime = document.querySelector('#eventModal .modal-end-time') as HTMLElement;

  if (modalStartTime && modalEndTime) {
    modalStartTime.textContent = arg.event.start ? arg.event.start.toISOString() : 'Not specified'; // Display the event's start time
    modalEndTime.textContent = arg.event.end ? arg.event.end.toISOString() : 'Not specified'; // Display the event's end time
  } else {
    throw new Error('modal start time or end time elements not found');
  }

  const modalElement = document.querySelector('#eventModal') as HTMLElement;
  if (modalElement) {
    modalElement.style.display = 'block';
    const modalTitle = document.querySelector('#eventModal .modal-title') as HTMLElement;
    if (modalTitle) {
      modalTitle.textContent = arg.event.title;
    } else {
      throw new Error('modalTitle not found');
    }
  }
}

const updateCalendar = (calendar: Calendar) => {
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
}) as flatpickr.Instance;

const form = document.getElementById('wf-form-custom_dates_form') as HTMLFormElement;

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Get the selected date and times from Flatpickr
    const selectedDateStr = selectedDate?.toLocaleString();

    // Get the email input element
    const emailInput = document.getElementById('email_2') as HTMLInputElement;
    const email = emailInput.value;

    // Check if the email ends with the "@umontreal.ca"
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

    // Add the selectedDateStr to your userAvailabilities object
    const formElements = form.elements as HTMLFormControlsCollection;
    const name = formElements.namedItem('name-2') as HTMLInputElement;
    const note = formElements.namedItem('note') as HTMLInputElement;
    const userAvailabilities = {
      name: name.value,
      email: email,
      selectedDate: selectedDateStr,
      note: note.value,
    };

    // Submit the userAvailabilities data here
    // eslint-disable-next-line no-console
    console.log(userAvailabilities);

    // Display the custom modal
    const customModal = document.getElementById('customModal');
    if (customModal) {
      customModal.style.display = 'block';
    }

    // Close the custom modal when the close button is clicked
    const closeModalButton = document.getElementById('closeModal');
    if (closeModalButton) {
      closeModalButton.addEventListener('click', () => {
        if (customModal) {
          customModal.style.display = 'none';
        }
      });
    }

    // Clear the selected date in Flatpickr
    preferredDatePicker.clear();

    // Call the showCustomModal function
    showCustomModal();
  });
}

(window as any).Webflow = (window as any).Webflow || { push: (callback: () => void) => callback() };
(window as any).Webflow.push(() => {
  const calendarElement = document.querySelector<HTMLDivElement>('[data-element="calendar"]');
  if (!calendarElement) return;

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
