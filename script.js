const monthYearEl = document.getElementById("monthYear");
const calendarGrid = document.getElementById("calendar-grid");

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let events = [];

document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

document.getElementById("todayBtn").addEventListener("click", () => {
  today = new Date();
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();
  renderCalendar();
});

async function fetchEvents() {
  const res = await fetch('events.json');
  events = await res.json();
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  monthYearEl.textContent = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  for (let i = firstDayIndex; i > 0; i--) {
    const dateNum = daysInPrevMonth - i + 1;
    const dateStr = new Date(currentYear, currentMonth - 1, dateNum).toISOString().split('T')[0];
    calendarGrid.innerHTML += createDayCell(dateNum, dateStr, false);
  }

  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarGrid.innerHTML += createDayCell(day, dateStr, true);
  }

  const remaining = 42 - calendarGrid.children.length;
  for (let i = 1; i <= remaining; i++) {
    const dateStr = new Date(currentYear, currentMonth + 1, i).toISOString().split('T')[0];
    calendarGrid.innerHTML += createDayCell(i, dateStr, false);
  }
}

function createDayCell(day, dateStr, isCurrentMonth) {
  const isToday = dateStr === new Date().toISOString().split('T')[0];
  const dateEvents = events.filter(e => e.date === dateStr);
  const maxToShow = 3;
  let eventHTML = "";
  const visibleEvents = dateEvents.slice(0, maxToShow);

  for (let ev of visibleEvents) {
    let timeDisplay = '';
    if (ev.startTime === "All day") {
      timeDisplay = "All day";
    } else if (ev.startTime && ev.endTime) {
      timeDisplay = `${ev.startTime} - ${ev.endTime}`;
    } else if (ev.startTime) {
      timeDisplay = ev.startTime;
    }
    eventHTML += `
      <div class="event" data-title="${ev.title}" data-start="${ev.startTime || ''}" data-end="${ev.endTime || ''}">
        <span class="event-title">${ev.title}</span>
        <span class="event-time">${timeDisplay}</span>
      </div>`;
  }

  if (dateEvents.length > maxToShow) {
    eventHTML += `<div class="more-indicator" data-date="${dateStr}">+${dateEvents.length - maxToShow} more</div>`;
  }

  return `
    <div class="date ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'faded' : ''}" data-date="${dateStr}">
      <div class="day-number">${day}</div>
      ${eventHTML}
    </div>
  `;
}

const modal = document.getElementById("event-modal");
const modalDate = document.getElementById("modal-date");
const modalList = document.getElementById("modal-events");
const modalClose = document.getElementById("modal-close");

modalClose.onclick = () => modal.classList.add("hidden");
window.onclick = (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
};

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("more-indicator")) {
    const date = e.target.getAttribute("data-date");
    const fullEvents = events.filter(ev => ev.date === date);
    modalDate.textContent = new Date(date).toDateString();
    modalList.innerHTML = fullEvents.map(ev => {
      let timeText = ev.startTime === "All day" ? "All day" : `${ev.startTime || ''}${ev.endTime ? ' - ' + ev.endTime : ''}`;
      return `<li><strong>${ev.title}</strong><br/><small>${timeText}</small></li>`;
    }).join("");
    modal.classList.remove("hidden");
  }

  if (e.target.closest(".event")) {
    const el = e.target.closest(".event");
    const title = el.dataset.title;
    const start = el.dataset.start;
    const end = el.dataset.end;
    const timeString = (start === "All day") ? "All day" : `${start || ''}${end ? ' - ' + end : ''}`;

    modalDate.textContent = title;
    modalList.innerHTML = `<li><strong>Time:</strong> ${timeString}</li>`;
    modal.classList.remove("hidden");
  }
});

fetchEvents().then(renderCalendar);
