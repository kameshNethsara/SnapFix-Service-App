console.log("Script loaded");

$(document).ready(function () {

    // Authentication check
    if (!localStorage.getItem("jwtToken") || !localStorage.getItem("userId")) {
        Swal.fire({
            icon: 'error',
            title: 'Authentication Required',
            text: 'Please log in to rate technicians',
            willClose: () => window.location.href = '/Front_End/html/login.html'
        });
        return;
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role'); // store user role at login
    console.log('User role:', role);

    // Only update location if role is USER or TECHNICIAN
    if (role === 'USER' || role === 'TECHNICIAN') {

        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.permissions.query({ name: 'geolocation' }).then(result => {
                    console.log('Geolocation permission state:', result.state);
                    if (result.state === 'denied') {
                        console.error('Location access is blocked. Please allow it in browser settings.');
                        return;
                    }

                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const latitude = position.coords.latitude;
                            const longitude = position.coords.longitude;
                            const token = localStorage.getItem("jwtToken");

                            console.log('User Location:', latitude, longitude);
                            console.log('Latitude:', position.coords.latitude);
                            console.log('Longitude:', position.coords.longitude);
                            console.log('Accuracy (meters):', position.coords.accuracy);

                            fetch('http://localhost:8080/snapfix/user/updateLocation', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}` // fixed key
                                },
                                body: JSON.stringify({
                                    userId: parseInt(localStorage.getItem('userId')),
                                    latitude: latitude,
                                    longitude: longitude
                                })
                            })
                            .then(res => res.json())
                            .then(data => console.log('Location updated:', data))
                            .catch(err => console.error('Error updating location:', err));
                        },
                        (error) => {
                            console.error('Error getting location:', error);
                        },
                        {
                            enableHighAccuracy: true,
                            maximumAge: 0,
                            timeout: 10000
                        }
                    );
                });
            } else {
                console.error('Geolocation is not supported by this browser.');
            }
        };

        // Initial location update
        updateLocation();

        // Periodic update every 5 minutes
        setInterval(updateLocation, 300000);
    }
});
