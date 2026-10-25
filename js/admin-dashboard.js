(function () {
  if (new URLSearchParams(window.location.search).get('demo') !== '1') {
    return;
  }

  // TEMPORARY: remove before final merge
  const demoData = {
    stats: [
      { key: 'students', value: '1,245', trend: '↑ 12 this month' },
      { key: 'teachers', value: '86', trend: '↑ 8 this month' },
      { key: 'attendance', value: '92%', trend: '↑ 5%' },
      { key: 'fees', value: '₦2,450,000', trend: '↑ 18% this month' },
      { key: 'parents', value: '1,102', trend: '↑ 10 this month' }
    ],
    activities: [
      { icon: '🧑‍🎓', title: 'New Student Admission', description: 'Mary Johnson was admitted', time: '10:30 AM' },
      { icon: '💸', title: 'Fee Payment Received', description: '₦25,000 by James Okoro', time: '09:15 AM' },
      { icon: '📄', title: 'Assignment Submitted', description: 'Physics – Class 10A', time: 'Yesterday' },
      { icon: '👨‍🏫', title: 'Teacher Added', description: 'Mr. David Brown joined', time: 'Yesterday' }
    ],
    attendance: [25, 44, 65, 60, 77, 72, 90, 84]
  };

  demoData.stats.forEach(({ key, value, trend }) => {
    const stat = document.querySelector(`[data-dashboard-stat="${key}"]`);
    const trendElement = document.querySelector(`[data-dashboard-trend="${key}"]`);
    if (!stat || !trendElement) {
      throw new Error(`Dashboard is missing the ${key} statistic or trend element.`);
    }

    stat.textContent = value;
    trendElement.textContent = trend;
    trendElement.classList.remove('text-muted');
    trendElement.classList.add('text-success');
  });

  const activityList = document.querySelector('[data-dashboard-activity]');
  const activityEmpty = document.querySelector('[data-dashboard-activity-empty]');
  if (!activityList || !activityEmpty) {
    throw new Error('Dashboard activity requires its list and empty-state elements.');
  }

  demoData.activities.forEach(({ icon, title, description, time }) => {
    const item = document.createElement('li');
    item.className = 'flex gap-3 py-2.5';

    const iconElement = document.createElement('span');
    iconElement.className = 'shrink-0 text-base';
    iconElement.setAttribute('aria-hidden', 'true');
    iconElement.textContent = icon;

    const content = document.createElement('div');
    content.className = 'min-w-0 flex-1';

    const titleElement = document.createElement('p');
    titleElement.className = 'text-xs font-semibold text-text';
    titleElement.textContent = title;

    const descriptionElement = document.createElement('p');
    descriptionElement.className = 'mt-0.5 text-xs text-muted';
    descriptionElement.textContent = description;

    const timeElement = document.createElement('span');
    timeElement.className = 'shrink-0 text-xs text-muted';
    timeElement.textContent = time;

    content.append(titleElement, descriptionElement);
    item.append(iconElement, content, timeElement);
    activityList.append(item);
  });

  activityEmpty.classList.add('hidden');
  activityList.classList.remove('hidden');

  const chartLine = document.querySelector('[data-attendance-line]');
  const chartArea = document.querySelector('[data-attendance-area]');
  const chartPoints = document.querySelector('[data-attendance-points]');
  const chartEmpty = document.querySelector('[data-dashboard-chart-empty]');
  if (!chartLine || !chartArea || !chartPoints || !chartEmpty) {
    throw new Error('Dashboard attendance chart is missing required elements.');
  }

  const points = demoData.attendance.map((value, index) => ({
    x: 30 + index * 80,
    y: 190 - value * 1.8
  }));
  const pointList = points.map(({ x, y }) => `${x},${y}`).join(' ');

  chartLine.setAttribute('points', pointList);
  chartArea.setAttribute('points', `30,190 ${pointList} ${points[points.length - 1].x},190`);

  const namespace = 'http://www.w3.org/2000/svg';
  points.forEach(({ x, y }) => {
    const point = document.createElementNS(namespace, 'circle');
    point.setAttribute('cx', String(x));
    point.setAttribute('cy', String(y));
    point.setAttribute('r', '3.5');
    point.setAttribute('fill', 'currentColor');
    chartPoints.append(point);
  });

  chartEmpty.classList.add('hidden');
})();
