// Initialize map centered on Sri Lanka
        var map = L.map('map').setView([6.9271, 79.8612], 8);

        // Map tiles (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Object to store technician markers
        var technicianMarkers = {};

        // Fetch technician locations from backend
        function fetchTechnicianLocations() {
            fetch('http://localhost:8080/api/technicians/locations') // adjust backend URL if needed
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
                            // Update existing marker position
                            technicianMarkers[id].setLatLng([lat, lng]);
                        } else {
                            // Add new marker with popup
                            const marker = L.marker([lat, lng]).addTo(map)
                                .bindPopup(`<b>${name}</b><br>ID: ${id}`);
                            technicianMarkers[id] = marker;
                        }
                    });
                })
                .catch(err => console.error("Error fetching locations:", err));
        }

        // Run once on load
        fetchTechnicianLocations();

        // Refresh every 5 seconds
        setInterval(fetchTechnicianLocations, 5000);