const calendarNav = document.querySelector(".calendar-navigation");
const calendarDiv = document.getElementById("calendar");
const moodButtons = document.querySelectorAll(".mood-btn");
const viewButtons = document.querySelectorAll(".view-btn");
const prevBtn = document.getElementById("prev-cal");
const nextBtn = document.getElementById("next-cal");


const MONTHS = ["January", "February", "March", "April", "May", "June", "July", 
                "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();



let selectedMood = null;
let currentView = 'month';


const getMoodData = () => JSON.parse(localStorage.getItem('moodData')) || {};
const saveMoodData = (data) => localStorage.setItem('moodData', JSON.stringify(data));

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Mood selection handling
moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        moodButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedMood = btn.textContent;
    });
});

// View toggle handling
viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = btn.dataset.view;
        showTimelineView(currentView);
    });
});

// Calendar navigation
prevBtn.addEventListener('click', () => {
    month--;
    if (month < 0) {
        month = 11;
        year--;
    }
    renderCalendar();
});

nextBtn.addEventListener('click', () => {
    month++;
    if (month > 11) {
        month = 0;
        year++;
    }
    renderCalendar();
});

function renderCalendar() {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const moodData = getMoodData();
    
    let calendarHTML = `
        <div class="calendar-header">
            <h3>${MONTHS[month]} ${year}</h3>
        </div>
        <div class="weekdays">
            ${WEEKDAYS.map(day => `<div>${day}</div>`).join('')}
        </div>
        <div class="days">
    `;

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
        calendarHTML += '<div class="inactive"></div>';
    }

    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = formatDate(new Date(year, month, day));
        const mood = moodData[currentDate];
        const isToday = currentDate === formatDate(new Date());
        
        calendarHTML += `
            <div class="day ${isToday ? 'active' : ''}" data-date="${currentDate}">
                ${day}
                ${mood ? `<span class="mood">${mood}</span>` : ''}
            </div>
        `;
    }

    calendarDiv.innerHTML = calendarHTML;


    document.addEventListener('DOMContentLoaded', () => {
        // Find and activate the month view button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    
        // Find and activate the month view button
        const monthButton = document.querySelector('.view-btn[data-view="month"]');
        if (monthButton) {
            monthButton.classList.add('active');
            renderCalendar(); // Render the calendar in month view
        }
        // Clear any previously selected moods
        moodButtons.forEach(btn => btn.classList.remove('selected'));
        selectedMood = null;
    });

    // Add click handlers to days
    document.querySelectorAll('.day').forEach(dayElement => {
        dayElement.addEventListener('click', () => {const dateStr = dayElement.dataset.date;
            const moodData = getMoodData();
            const existingMood = moodData[dateStr];
            const moodSpan = dayElement.querySelector('.mood');

            // If clicking on a day that already has the same mood, remove it
            if (existingMood && existingMood === selectedMood) {
                delete moodData[dateStr];
                if (moodSpan) {
                    moodSpan.remove();
                }
                saveMoodData(moodData);
                return;
            }

            
            
            moodData[dateStr] = selectedMood;
            saveMoodData(moodData);
            
            if (moodSpan) {
                moodSpan.textContent = selectedMood;
            } else {
                const newMoodSpan = document.createElement('span');
                newMoodSpan.className = 'mood';
                newMoodSpan.textContent = selectedMood;
                dayElement.appendChild(newMoodSpan);
            }

            selectedMood = null;
            moodButtons.forEach(btn => btn.classList.remove('selected'));
        });
    });
    }


// Initial render
renderCalendar();

// Function to show different timeline views
function showTimelineView(view) {
    const moodData = getMoodData();
    let content = '';
    const today = new Date();

    switch(view) {
        case 'day':
            const todayStr = formatDate(today);
            content = `
                <h3>Today's Mood</h3>
                <div class="timeline-day">
                    ${moodData[todayStr] ? moodData[todayStr] : 'No mood recorded'}
                </div>
            `;
            break;

        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            content = `<h3>This Week's Moods</h3><div class="timeline-week">`;
            
            for(let i = 0; i < 7; i++) {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + i);
                const dateStr = formatDate(date);
                content += `
                    <div class="timeline-day">
                        <div>${WEEKDAYS[i]}</div>
                        <div>${moodData[dateStr] || '-'}</div>
                    </div>
                `;
            }
            content += '</div>';
            break;

        case 'month':
            renderCalendar();
            return;
    }

    calendarDiv.innerHTML = content;
}

// Event listeners for view toggle
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        showTimelineView(view);
    });
});