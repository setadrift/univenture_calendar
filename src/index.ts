import 'flatpickr/dist/flatpickr.min.css';

import { Calendar, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import flatpickr from 'flatpickr';

import type { Event } from './types';

const getEvents = (): Event[] => {
  const scripts = document.querySelectorAll<HTMLScriptElement>('[data-element="event-data"]');
  const events = [...scripts].reduce((acc, script) => {
    if (script.textContent) {
      const eventData = JSON.parse(script.textContent);
      const event: Event = {
        ...eventData,
        start: new Date(eventData.start),
        end: new Date(eventData.end),
        session: parseInt(eventData.session, 10), // parse the session number as an integer
      };
      acc.push(event);
    }
    return acc;
  }, [] as Event[]);

  return events;
};

let selectedSession = 1;
const userAvailabilities: { session1: Date[]; session2: Date[] } = {
  session1: [],
  session2: [],
};

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
const eventClick = (arg: EventClickArg) => {
  // eslint-disable-next-line no-console
  console.log('eventClick', arg.event.title);
  const selectedDate = new Date(arg.event.start as unknown as string);

  const modalElement = document.querySelector('#eventModal') as HTMLElement;
  if (modalElement) {
    modalElement.style.display = 'block';
    // get the title of the selected event and set it as the titel for the modal
    const modalTitle = document.querySelector('#eventModal .modal-title') as HTMLElement;
    if (modalTitle) {
      modalTitle.textContent = arg.event.title;
    } else {
      throw new Error('modalTitle not found');
    }

    if (selectedSession === 1) {
      userAvailabilities.session1.push(selectedDate);
    } else {
      userAvailabilities.session2.push(selectedDate);
    }
  }
};

const updateCalendar = (calendar: Calendar, session: number) => {
  const events = getEvents().filter((event) => event.session === session);
  calendar.getEventSources().forEach((source) => source.remove());
  calendar.addEventSource(events);
};

// Create two separate Flatpickr instances
const preferredDatePicker1 = flatpickr('#Preferred-Date-1', {
  dateFormat: 'Y-m-d H:i',
  enableTime: true,
  time_24hr: true,
  mode: 'multiple',
  onChange: (selectedDates) => updateSelectedDatesList(selectedDates, 1),
}) as flatpickr.Instance;

const preferredDatePicker2 = flatpickr('#Preferred-Date-2', {
  dateFormat: 'Y-m-d H:i',
  enableTime: true,
  time_24hr: true,
  mode: 'multiple',
  onChange: (selectedDates) => updateSelectedDatesList(selectedDates, 2),
}) as flatpickr.Instance;

// Update the updateSelectedDatesList function to handle the session number
function updateSelectedDatesList(selectedDates: unknown[], session: number) {
  const listElement = document.querySelector(`#selected-dates-list-${session}`);
  if (!listElement) return;

  listElement.innerHTML = ''; // Clear the list

  selectedDates.forEach((date, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = date.toLocaleString(); // Format the date and time

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete date';
    deleteButton.addEventListener('click', () => {
      // Remove the date from the selected dates array
      if (session === 1) {
        preferredDatePicker1.selectedDates.splice(index, 1);
        preferredDatePicker1.redraw();
      } else {
        preferredDatePicker2.selectedDates.splice(index, 1);
        preferredDatePicker2.redraw();
      }
      // Update the list
      updateSelectedDatesList(
        session === 1 ? preferredDatePicker1.selectedDates : preferredDatePicker2.selectedDates,
        session
      );
    });

    listItem.appendChild(deleteButton);
    listElement.appendChild(listItem);
  });

  // Show the list container
  const listContainer = document.querySelector(`#selected-dates-list-${session}`) as HTMLElement;
  if (listContainer) {
    listContainer.style.display = selectedDates.length ? 'block' : 'none';
  }
}

// Trigger the initial update for both lists
updateSelectedDatesList(preferredDatePicker1.selectedDates, 1);
updateSelectedDatesList(preferredDatePicker2.selectedDates, 2);

const form = document.getElementById('wf-form-custom_dates_form') as HTMLFormElement;

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Get the selected dates and times from Flatpickr
    const session1SelectedDates = preferredDatePicker1.selectedDates;
    const session2SelectedDates = preferredDatePicker2.selectedDates;

    // Convert the selected dates to an array of strings
    const session1SelectedDatesStrings = session1SelectedDates.map((date) => date.toLocaleString());
    const session2SelectedDatesStrings = session2SelectedDates.map((date) => date.toLocaleString());

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

    // Add the selectedDatesStrings array to your userAvailabilities object
    const formElements = form.elements as HTMLFormControlsCollection;
    const name = formElements.namedItem('name-2') as HTMLInputElement;
    const note = formElements.namedItem('note') as HTMLInputElement;
    const userAvailabilities = {
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

    // Clear the selected dates in Flatpickr and update the list
    preferredDatePicker1.clear();
    preferredDatePicker2.clear();
    updateSelectedDatesList([], 1);
    updateSelectedDatesList([], 2);

    // Call the showCustomModal function
    showCustomModal();
  });
}

window.Webflow ||= [];
window.Webflow.push(() => {
  const calendarElement = document.querySelector<HTMLDivElement>('[data-element="calendar"]');
  if (!calendarElement) return;

  const events = getEvents();
  const sessionSelector = document.getElementById('session-selector') as HTMLSelectElement;

  if (sessionSelector) {
    sessionSelector.addEventListener('change', () => {
      selectedSession = parseInt(sessionSelector.value, 10);
      updateCalendar(calendar, selectedSession);
    });
  }

  const calendar = new Calendar(calendarElement, {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listPlugin',
    },
    events,
    eventClick,
  });

  calendar.render();
});
