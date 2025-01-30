chrome.storage.local.get('timeSpent', (data) => {
  let timeSpent = data.timeSpent || {};
  let timeDisplay = document.getElementById('timeSpent');
  
  if (Object.keys(timeSpent).length > 0) {
    let listHTML = '<ul>';
    for (let domain in timeSpent) {
      let { time, favicon } = timeSpent[domain];
      let hours = Math.floor(time / 3600);
      let minutes = Math.floor((time % 3600) / 60);
      let seconds = time % 60;
      
      listHTML += `
        <li>
          <img src="${favicon}" alt="${domain} favicon" class="favicon">
          <span class="website-name">${domain}</span>
          <span class="time-spent">${hours}h ${minutes}m ${seconds}s</span>
        </li>
      `;
    }
    listHTML += '</ul>';
    timeDisplay.innerHTML = listHTML;
  } else {
    timeDisplay.innerHTML = '<p>No time tracked yet!</p>';
  }
});

// Listen for updates to timeSpent in chrome.storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.timeSpent) {
    let timeSpent = changes.timeSpent.newValue;
    let timeDisplay = document.getElementById('timeSpent');
    
    if (Object.keys(timeSpent).length > 0) {
      let listHTML = '<ul>';
      for (let domain in timeSpent) {
        let { time, favicon } = timeSpent[domain];
        let hours = Math.floor(time / 3600);
        let minutes = Math.floor((time % 3600) / 60);
        let seconds = time % 60;
        
        listHTML += `
          <li>
            <img src="${favicon}" alt="${domain} favicon" class="favicon">
            <span class="website-name">${domain}</span>
            <span class="time-spent">${hours}h ${minutes}m ${seconds}s</span>
          </li>
        `;
      }
      listHTML += '</ul>';
      timeDisplay.innerHTML = listHTML;
    } else {
      timeDisplay.innerHTML = '<p>No time tracked yet!</p>';
    }
  }
});

// Listen for the reset button click in the popup
document.getElementById('resetBtn').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: 'reset' }, (response) => {
    console.log(response.status);  // Log the response from the background
  });
});

// Open the Productivity Report modal when the report button is clicked
document.getElementById('reportBtn').addEventListener('click', () => {
  document.getElementById('reportModal').style.display = 'block';

  // Fetch the timeSpent data from storage and display the report
  chrome.storage.local.get('timeSpent', (data) => {
    let timeSpent = data.timeSpent || {};
    let domains = [];
    let times = [];

    // Prepare data for chart (sort by most time spent)
    for (let domain in timeSpent) {
      domains.push(domain);
      times.push(timeSpent[domain].time);
    }

    // Create the chart
    createReportChart(domains, times);
  });
});

// Close the modal when the close button is clicked
document.getElementById('closeModalBtn').addEventListener('click', () => {
  document.getElementById('reportModal').style.display = 'none';
});

// Function to create the chart using Chart.js
function createReportChart(domains, times) {
  var ctx = document.getElementById('reportChart').getContext('2d');
  
  var chart = new Chart(ctx, {
    type: 'bar', // You can also use 'pie' or 'line'
    data: {
      labels: domains,
      datasets: [{
        label: 'Time Spent (seconds)',
        data: times,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
