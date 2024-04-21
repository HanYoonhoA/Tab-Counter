// Function to update the display of the website list based on the selected display type
function updateWebsiteListDisplay(websiteCounts, displayType) {
  const websiteList = document.getElementById('websiteList');
  websiteList.innerHTML = ''; // Clear the current list

  let index = 1;
  for (const [website, count] of Object.entries(websiteCounts)) {
    let listItemText;
    if (displayType === 'AB') {
      listItemText = `${website}: ${count}`;
    } else {
      listItemText = `${index}-${index + 9}: ${website}: ${count}`;
      index += 10;
    }
    const listItem = document.createElement('li');
    listItem.textContent = listItemText;
    websiteList.appendChild(listItem);
  }
}

// Function to filter the website list based on the search input
function filterWebsiteList(websiteCounts, searchString) {
  const filteredWebsiteCounts = {};
  for (const [website, count] of Object.entries(websiteCounts)) {
    if (website.toLowerCase().includes(searchString.toLowerCase())) {
      filteredWebsiteCounts[website] = count;
    }
  }
  return filteredWebsiteCounts;
}

document.addEventListener('DOMContentLoaded', () => {
  // Retrieve the tab count, website counts, most recent opened, and most recent closed from chrome.storage
  chrome.storage.local.get(['tabCount', 'websiteCounts', 'mostRecentOpened', 'mostRecentClosed'], (data) => {
    const tabCount = data.tabCount || 0;
    const websiteCounts = data.websiteCounts || {};
    const mostRecentOpened = data.mostRecentOpened;
    const mostRecentClosed = data.mostRecentClosed;

    // Display total tab count
    document.getElementById('tabCount').textContent = `Total Tabs open: ${tabCount}`;

    // Display most recent opened and most recent closed
    if (mostRecentOpened) {
      document.getElementById('recentOpened').innerHTML = `Most Recent Opened: <a href="${mostRecentOpened.url}" target="_blank">${mostRecentOpened.title}</a>`;
    }

    if (mostRecentClosed) {
      document.getElementById('recentClosed').innerHTML = `Most Recent Closed: <a href="${mostRecentClosed.url}" target="_blank">${mostRecentClosed.title}</a>`;
    }

    // Initial display type and search input
    let displayType = 'AB';
    let searchString = '';

    // Render the website list based on the initial display type
    updateWebsiteListDisplay(websiteCounts, displayType);

    // Handle changes in the display type dropdown
    document.getElementById('displayType').addEventListener('change', (event) => {
      displayType = event.target.value;
      updateWebsiteListDisplay(websiteCounts, displayType);
    });

    // Handle changes in the search input
    document.getElementById('searchInput').addEventListener('input', (event) => {
      searchString = event.target.value.trim();
      const filteredWebsiteCounts = filterWebsiteList(websiteCounts, searchString);
      updateWebsiteListDisplay(filteredWebsiteCounts, displayType);
    });

    // Handle sorting alphabetically
    document.getElementById('sortAlphabetically').addEventListener('click', () => {
      const sortedWebsiteCounts = Object.fromEntries(Object.entries(websiteCounts).sort(([a], [b]) => a.localeCompare(b)));
      updateWebsiteListDisplay(sortedWebsiteCounts, displayType);
    });

    // Handle sorting by tab count
    document.getElementById('sortByCount').addEventListener('click', () => {
      const sortedWebsiteCounts = Object.fromEntries(Object.entries(websiteCounts).sort(([, a], [, b]) => b - a));
      updateWebsiteListDisplay(sortedWebsiteCounts, displayType);
    });

    // Handle theme selection
    document.getElementById('theme').addEventListener('change', (event) => {
      const selectedTheme = event.target.value;
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(selectedTheme);
    });

    // Handle clicking on a website link
    document.getElementById('websiteList').addEventListener('click', (event) => {
      const target = event.target;
      if (target.tagName === 'A') {
        chrome.tabs.create({ url: target.href });
      }
    });
  });
});
