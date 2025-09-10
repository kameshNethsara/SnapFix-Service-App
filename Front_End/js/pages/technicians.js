$(document).ready(function() {
    const apiUrl = "http://localhost:8080/snapfix/user/getall";
    const token = localStorage.getItem("jwtToken"); 

    let technicians = [];

    // ============================
    // Load all technicians
    // ============================
    async function loadTechnicians() {
        const container = $("#technician-cards");
        container.html('<div class="loading-spinner"><div class="spinner"></div></div>');

        try {
            const res = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const response = await res.json();

            const users = Array.isArray(response.data) ? response.data : [];
            technicians = users.filter(user => user.userRole?.toUpperCase() === "TECHNICIAN");

            renderTechnicianCards(technicians);

        } catch (err) {
            console.error("Error loading technicians:", err);
            container.html(`
                <div class="no-results">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Failed to load technicians</h3>
                    <p>Please check your connection and try again</p>
                </div>
            `);
        }
    }

    // ============================
    // Render technician cards
    // ============================
    function renderTechnicianCards(techArray) {
    const container = $("#technician-cards");
    if (techArray.length === 0) {
        container.html(`
            <div class="no-results">
                <i class="fas fa-user-times"></i>
                <h3>No technicians found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `);
        return;
    }

    let html = '';
    techArray.forEach(tech => {
        const rating = tech.rating || 0;
        let starsHtml = "";
        for (let j = 1; j <= 5; j++) {
            starsHtml += j <= rating 
                ? `<i class="fas fa-star text-warning"></i>` 
                : `<i class="far fa-star text-warning"></i>`;
        }

        const isAvailable = tech.availability === true || tech.availability === "true";
        const imageURL = tech.userImgURL || '/Front_End/assets/img/default-user.jpeg';

        html += `
        <div class="col">
            <div class="technician-card">
                <div class="card-img-container">
                    <img 
                        src="${imageURL}" 
                        alt="${tech.userFullName}"
                        onerror="this.src='/Front_End/assets/img/default-user.jpeg'"
                    >
                    <span class="status-badge ${isAvailable ? 'status-available' : 'status-offline'}">
                        ${isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                </div>
                <div class="card-body">
                    <h5 class="technician-name">${tech.userFullName}</h5>
                    <div class="rating">${starsHtml} <span class="ms-1">(${rating.toFixed(1)})</span></div>
                    <p class="info-item"><i class="fas fa-phone"></i> ${tech.userMobile || 'N/A'}</p>
                    <p class="info-item"><i class="fas fa-envelope"></i> ${tech.userEmail || 'Email not provided'}</p>
                    <p class="info-item"><i class="fas fa-building"></i> ${tech.userDepartment || 'No department assigned'}</p>
                    <p class="info-item"><i class="fas fa-map-marker-alt"></i> ${tech.city || 'Location not specified'}</p>
                    <p>${tech.userInfo || 'No description provided.'}</p>
                    <button class="request-btn" ${isAvailable ? '' : 'disabled'} data-id="${tech.userId}">
                        ${isAvailable ? 'Request Service' : 'Not Available'}
                    </button>
                </div>
            </div>
        </div>
        `;
    });

    container.html(html);

        // ============================
        // Request button click
        // ============================
        $(".request-btn:not(:disabled)").on("click", function() {
            const techId = $(this).data("id");
            const techName = $(this).closest('.technician-card').find('.technician-name').text();

            Swal.fire({
                title: "Confirm Request",
                html: `Send service request to <strong>${techName}</strong>?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes, send request",
                cancelButtonText: "Cancel"
            }).then((result) => {
                 if (result.isConfirmed) {
                     sendRequestToTechnician(techId, techName);
                     addActivity("Selected Technician", "Select", `You selected technician ${techName} (ID: ${techId}) for a service request.`);

                    // After sending the request, redirect to the service-request page
                    window.location.href = "/Front_End/html/pages/service-request.html";
                }
            });
        });
    }

    // ============================
    // Filter & search functionality
    // ============================
    function setupFiltering() {
        $('#searchInput, #availabilityFilter, #sortSelect').on('change keyup', function() {
            const searchText = $('#searchInput').val().toLowerCase();
            const availabilityFilter = $('#availabilityFilter').val();
            const sortBy = $('#sortSelect').val();

            let filteredTechs = technicians.filter(tech => {
                const matchesSearch = tech.userFullName.toLowerCase().includes(searchText) || 
                    (tech.userInfo && tech.userInfo.toLowerCase().includes(searchText)) ||
                    (tech.city && tech.city.toLowerCase().includes(searchText));

                const matchesAvailability = availabilityFilter === 'all' ? true :
                    (tech.availability === true || tech.availability === "true");

                return matchesSearch && matchesAvailability;
            });

            if (sortBy === 'rating') {
                filteredTechs.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            } else if (sortBy === 'name') {
                filteredTechs.sort((a, b) => a.userFullName.localeCompare(b.userFullName));
            }

            renderTechnicianCards(filteredTechs);
        });
    }
  
    // ============================
    // Search by keyword via API
    // ============================
    async function searchTechnicians(keyword) {
        if (!keyword || keyword.trim() === "") {
            renderTechnicianCards(technicians); // show all
            return;
        }

      const searchField = 'name'; // change to username/email/mobile/city if needed
      const baseUrl = "http://localhost:8080/snapfix/user";
        try {
            const res = await fetch(`${baseUrl}/search/${searchField}/${encodeURIComponent(keyword)}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) throw new Error(`Search failed with status ${res.status}`);
            const response = await res.json();
            const filteredTechs = Array.isArray(response.data)
                ? response.data.filter(user => user.userRole?.toUpperCase() === "TECHNICIAN")
                : [];

            renderTechnicianCards(filteredTechs);
        } catch (err) {
            console.error("Search error:", err);
        }
    }

    // ============================
    // Event: Search input
    // ============================
    $('#searchInput').on('keyup', function() {
        const keyword = $(this).val();
        searchTechnicians(keyword);
    });

    // ============================
    // Send service request (select technician)
    // ============================
    async function sendRequestToTechnician(techId, techName) {
        // Just save technician info in localStorage
        localStorage.setItem("selectedTechnicianId", techId);
        localStorage.setItem("selectedTechnicianName", techName);
        // console.log(`Technician ${techName} (ID: ${techId}) selected and saved to localStorage.`);

        // (Optional) show confirmation
        Swal.fire({
            icon: "success",
            title: "Technician Selected",
            text: `You selected ${techName}. Please complete your request form.`,
            timer: 1500,
            showConfirmButton: false
        });
    }

    // ============================
    // Initialize
    // ============================
    loadTechnicians();
    setTimeout(setupFiltering, 1000);
});