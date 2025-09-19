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

// Function to create a colored map icon
function createColoredIcon(available) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<i style="color:${available ? 'green' : 'red'}; font-size: 24px;" class="fas fa-map-marker-alt"></i>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
}

// Function to create popup content with technician image
function createPopupContent(tech) {
  const name = tech.name || "Unnamed Technician";
  const id = tech.userId;
  const available = tech.availability;
  const imgUrl = tech.imgURL || 'default-tech.png'; // fallback image

  return `
    <div style="text-align:center;">
      <img src="${imgUrl}" alt="${name}" style="width:60px; height:60px; border-radius:50%; margin-bottom:5px; object-fit:cover;">
      <div><b>${name}</b></div>
      <div>ID: ${id}</div>
      <div>Status: ${available ? "Available" : "Working"}</div>
    </div>
  `;
}

// Fetch technician locations from backend
function fetchTechnicianLocations() {
  showLoader();

  const token = localStorage.getItem("jwtToken");
  if (!token) {
    hideLoader();
    Swal.fire({
      icon: 'error',
      title: 'Authentication Required',
      text: 'Please log in to view technician locations',
      willClose: () => window.location.href = '/Front_End/html/login.html'
    });
    return;
  }

  fetch('http://localhost:8080/snapfix/user/technicians/locations', {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch technician locations");
    return response.json();
  })
  .then(data => {
    const currentIds = new Set();
    console.log("Technicians received from backend:", data);

    data.forEach(tech => {
      const id = String(tech.userId);
      const lat = tech.latitude;
      const lng = tech.longitude;
      const available = tech.availability;

      if (lat == null || lng == null) return;

      currentIds.add(id);

      const icon = createColoredIcon(available);
      const popupContent = createPopupContent(tech);

      if (technicianMarkers[id]) {
        // Update existing marker
        technicianMarkers[id].setLatLng([lat, lng]);
        technicianMarkers[id].setIcon(icon);
        technicianMarkers[id].getPopup().setContent(popupContent);
      } else {
        // Create new marker
        const marker = L.marker([lat, lng], { icon: icon })
          .addTo(map)
          .bindPopup(popupContent);
        technicianMarkers[id] = marker;
      }
    });

    // Remove markers no longer in backend
    for (const id in technicianMarkers) {
      if (!currentIds.has(id)) {
        map.removeLayer(technicianMarkers[id]);
        delete technicianMarkers[id];
      }
    }
  })
  .catch(err => {
    console.error("Error fetching technician locations:", err);
    Swal.fire("Error", "Could not load technician locations", "error");
  })
  .finally(() => {
    hideLoader();
  });
}

// Run once on page load
fetchTechnicianLocations();

// Refresh every 60 seconds
setInterval(fetchTechnicianLocations, 5*60000);

// Authentication check on page load
$(document).ready(function () {
  const token = localStorage.getItem("jwtToken");
  const currentUserId = localStorage.getItem("userId");

  if (!token || !currentUserId) {
    Swal.fire({
      icon: 'error',
      title: 'Authentication Required',
      text: 'Please log in to continue',
      willClose: () => window.location.href = '/Front_End/html/login.html'
    });
  }
});
