// Initialize map centered on Sri Lanka
var map = L.map('map').setView([6.9271, 79.8612], 8);

// Map tiles (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// Object to store technician markers
var technicianMarkers = {};

// Show/hide loader
function showLoader() {
  document.getElementById("loadingOverlay").style.display = "flex";
}
function hideLoader() {
  document.getElementById("loadingOverlay").style.display = "none";
}

// Fetch technician locations from backend
function fetchTechnicianLocations() {
  showLoader();

  fetch('http://localhost:8080/api/technicians/locations')
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch technician locations");
      }
      return response.json();
    })
    .then(data => {
      data.forEach(tech => {
        const id = tech.userId;
        const lat = tech.latitude;
        const lng = tech.longitude;
        const name = tech.name;

        if (technicianMarkers[id]) {
          technicianMarkers[id].setLatLng([lat, lng]);
        } else {
          const marker = L.marker([lat, lng]).addTo(map)
            .bindPopup(`<b>${name}</b><br>ID: ${id}`);
          technicianMarkers[id] = marker;
        }
      });
    })
    .catch(err => console.error("Error fetching locations:", err))
    .finally(() => {
      hideLoader();
    });
}

// Run once on load
fetchTechnicianLocations();

// Refresh every 5 seconds
setInterval(fetchTechnicianLocations, 5000);

// Authentication check
$(document).ready(function () {

    const token = localStorage.getItem("jwtToken");
    const currentUserId = localStorage.getItem("userId");

    if (!token || !currentUserId) {
        Swal.fire({
        icon: 'error',
        title: 'Authentication Required',
        text: 'Please log in to rate technicians',
        willClose: () => window.location.href = '/Front_End/html/login.html'
        });
        return;
    }
});
