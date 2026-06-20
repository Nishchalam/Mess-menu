// utils.js
// Date calculations and formatting helpers for Mess Menu App

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const WEEKS = ['A', 'B', 'C', 'D'];

// Align any date to the start of its week (Monday)
export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  // in JS getDay() is 0 (Sunday) to 6 (Saturday).
  // We want Monday (1) to be day 0 of our week, and Sunday (0) to be day 6.
  const daysToSubtract = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - daysToSubtract);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Calculate the cycle week (A, B, C, D) for a selected date
export const calculateWeekCycle = (selectedDate, anchorDateStr, anchorWeekName) => {
  const anchorDate = new Date(anchorDateStr);
  const anchorWeekIndex = WEEKS.indexOf(anchorWeekName);
  
  if (isNaN(anchorDate.getTime()) || anchorWeekIndex === -1) {
    // Default fallback
    return { week: 'A', dayName: 'Monday' };
  }

  const selectedMonday = getStartOfWeek(selectedDate);
  const anchorMonday = getStartOfWeek(anchorDate);

  // Difference in milliseconds
  const diffTime = selectedMonday.getTime() - anchorMonday.getTime();
  // Difference in weeks
  const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));

  // Compute week index modulo 4
  const cycleIndex = ((anchorWeekIndex + diffWeeks) % 4 + 4) % 4;
  const weekName = WEEKS[cycleIndex];

  // Day name calculation (Monday = 0, ..., Sunday = 6)
  const jsDay = selectedDate.getDay();
  const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const dayName = DAYS_OF_WEEK[dayIdx];

  return {
    week: weekName,
    dayName: dayName,
    dayIndex: dayIdx
  };
};

// Format Date as YYYY-MM-DD
export const formatDateInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

// Format Date as a friendly string, e.g. "Mon, Jun 22, 2026"
export const formatDateDisplay = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Get the 7 dates of the week (Monday to Sunday) for the selected date
export const getDaysOfWeekDates = (date) => {
  const monday = getStartOfWeek(date);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
};
