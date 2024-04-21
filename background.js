let mostRecentOpened = null;
let mostRecentClosed = null;

function updateTabCount() {
  console.log("Updating tab count...");
  chrome.tabs.query({}, (tabs) => {
    const tabCount = tabs.length;
    console.log("Tab count:", tabCount);

    // Count occurrences of each website
    const websiteCounts = {};
    tabs.forEach(tab => {
      try {
        const url = new URL(tab.url);
        const hostname = url.hostname;
        websiteCounts[hostname] = (websiteCounts[hostname] || 0) + 1;
      } catch (error) {
        console.error(`Invalid URL for tab ${tab.id}:`, tab.url); //Error will show up if you open a new Tab with no URL (Nothing big to fix)
      }
    });

    // Store tab count and website counts in chrome.storage
    const data = { tabCount: tabCount, websiteCounts: websiteCounts };
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        console.log("Tab count and website counts stored in storage.");
      }
    });

    // Find the most recent opened and closed tabs
    const sortedTabs = tabs.sort((a, b) => b.id - a.id);
    mostRecentOpened = sortedTabs.find(tab => tab.status === "complete" && tab.active);
    mostRecentClosed = sortedTabs.find(tab => tab.status === "complete" && !tab.active);
    
    // Store the most recent opened and closed tabs in chrome.storage
    chrome.storage.local.set({ mostRecentOpened, mostRecentClosed }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        console.log("Most recent opened and closed tabs stored in storage.");
      }
    });
  });
}

// Update tab count, website counts, most recent opened, and most recent closed when a tab is created, removed, or updated
chrome.tabs.onCreated.addListener(updateTabCount);
chrome.tabs.onRemoved.addListener(updateTabCount);
chrome.tabs.onUpdated.addListener(updateTabCount);
