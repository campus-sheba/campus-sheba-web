import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDayIndex(day) {
  return daysOfWeek.indexOf(day);
}

function getDayName(index) {
  return daysOfWeek[((index % 7) + 7) % 7];
}

function parseHMS(hms) {
  const [hh, mm, ss] = hms.split(':').map(Number);
  return hh * 3600 + mm * 60 + (ss || 0);
}

function formatHMS(totalSeconds) {
  const seconds = ((totalSeconds % 86400) + 86400) % 86400;
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function getLocalOffsetSeconds() {
  // getTimezoneOffset returns minutes behind UTC, so negate to get seconds ahead of UTC
  return -new Date().getTimezoneOffset() * 60;
}

export function convertAndSplitSchedule(schedules) {
  const offsetSeconds = getLocalOffsetSeconds();
  const fullDaySeconds = 86400;

  const converted = [];

  schedules.forEach(item => {
    const startSeconds = parseHMS(item.start_time);
    const endSeconds = parseHMS(item.end_time);
    const baseDayIndex = getDayIndex(item.dayOfWeek);

    // Shift times by offsetSeconds directly
    let localStart = startSeconds + offsetSeconds;
    let localEnd = endSeconds + offsetSeconds;

    // Normalize times into 0–86399 seconds range (one day)
    // const normalizedStart = ((localStart % fullDaySeconds) + fullDaySeconds) % fullDaySeconds;
    // const normalizedEnd = ((localEnd % fullDaySeconds) + fullDaySeconds) % fullDaySeconds;

    const startTime = formatHMS(localStart);
    const endTime = formatHMS(localEnd);

    if (startTime === '00:00:00' && endTime === '00:00:00') {
      return; // skip invalid slot
    }

    const dayShiftStart = Math.floor(localStart / fullDaySeconds);
    const dayShiftEnd = Math.floor(localEnd / fullDaySeconds);

    if (dayShiftStart === dayShiftEnd) {
      converted.push({
        ...item,
        start_time: startTime,
        end_time: endTime,
        dayOfWeek: getDayName(baseDayIndex + dayShiftStart),
      });
    } else {
      converted.push({
        ...item,
        start_time: startTime,
        end_time: '23:59:59',
        dayOfWeek: getDayName(baseDayIndex + dayShiftStart),
      });

      if (endTime !== '00:00:00') {
        converted.push({
          ...item,
          id: item.id + 10000,
          uuid: crypto.randomUUID?.() ?? '',
          start_time: '00:00:00',
          end_time: endTime,
          dayOfWeek: getDayName(baseDayIndex + dayShiftEnd),
        });
      }
    }
  });

  return converted;
}
