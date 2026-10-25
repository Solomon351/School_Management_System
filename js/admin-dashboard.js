(function () {
  if (new URLSearchParams(window.location.search).get('demo') !== '1') {
    return;
  }

  // TEMPORARY: remove before final merge
  const demoData = {
    totals: {
      students: 1248,
      teachers: 86,
      parents: 932,
      classes: 24
    },
    activity: [
      { description: 'A new student was added to JSS1A', time: '10 minutes ago' },
      { description: 'Mr. Daniel Okafor was added as a teacher', time: '35 minutes ago' },
      { description: 'SS2C class details were updated', time: '1 hour ago' },
      { description: 'A parent account was created for Adaobi Nwosu', time: '2 hours ago' },
      { description: 'The attendance register was updated for JSS3B', time: 'Yesterday' }
    ]
  };

  document.querySelectorAll('[data-dashboard-stat]').forEach((element) => {
    const key = element.getAttribute('data-dashboard-stat');
    if (Object.prototype.hasOwnProperty.call(demoData.totals, key)) {
      element.textContent = demoData.totals[key].toLocaleString();
    }
  });

  const activityList = document.querySelector('[data-dashboard-activity]');
  const emptyMessage = document.querySelector('[data-dashboard-activity-empty]');
  if (!activityList || !emptyMessage) {
    throw new Error('Dashboard activity requires its list and empty-state elements.');
  }

  demoData.activity.forEach(({ description, time }) => {
    const item = document.createElement('li');
    item.className = 'flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4';

    const text = document.createElement('p');
    text.className = 'text-sm text-text';
    text.textContent = description;

    const timestamp = document.createElement('span');
    timestamp.className = 'shrink-0 text-xs text-muted';
    timestamp.textContent = time;

    item.append(text, timestamp);
    activityList.append(item);
  });

  emptyMessage.classList.add('hidden');
  activityList.classList.remove('hidden');
})();
