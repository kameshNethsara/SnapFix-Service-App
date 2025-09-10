const BASE_URL = "http://localhost:8080/snapfix";
const SEARCH_TECH_URL = `${BASE_URL}/user/search/name/`;
const RATINGS_URL = `${BASE_URL}/ratings`;

let JWT = localStorage.getItem("jwtToken");
let CURRENT_USER_ID = localStorage.getItem("userId");
let selectedTechnicianId = null;
let selectedRating = 0;
let ratingLocked = false;
let searchTimeout = null;

// Service request info
const selectedRequestId = localStorage.getItem("selectedRequestId") || 0;
const storedTechnicianId = localStorage.getItem("selectedTechnicianId");

$(document).ready(function () {

    // Authentication check
    if (!JWT || !CURRENT_USER_ID) {
        Swal.fire({
            icon: 'error',
            title: 'Authentication Required',
            text: 'Please log in to rate technicians',
            willClose: () => window.location.href = '/Front_End/pages/login.html'
        });
        return;
    }

    // Load technician automatically if coming from service request
    if (storedTechnicianId) {
        selectTechnicianById(storedTechnicianId);
    }

    // Character count
    $("#comment").on("input", () => $("#charCount").text($("#comment").val().length));

    // Star hover & click
    $("#starRow").on("mouseenter", ".star", function () {
        if (!ratingLocked) {
            const val = $(this).data("value");
            highlightStars(val);
            updateRatingLabel(val);
        }
    }).on("mouseleave", ".star", function () {
        if (!ratingLocked) {
            highlightStars(selectedRating);
            updateRatingLabel(selectedRating);
        }
    }).on("click", ".star", function () {
        selectedRating = $(this).data("value");
        highlightStars(selectedRating);
        updateRatingLabel(selectedRating);
        ratingLocked = true;
    });

    // Search button click
    $("#searchTechBtn").click(() => {
        const keyword = $("#searchTechInput").val().trim();
        if (!keyword) return Swal.fire("Info", "Please enter a technician name to search", "info");
        searchTechnician(keyword);
    });

    // Enter key search
    $("#searchTechInput").keypress((e) => {
        if (e.which === 13) {
            const keyword = $("#searchTechInput").val().trim();
            if (keyword) searchTechnician(keyword);
        }
    });

    // Debounced input search
    $("#searchTechInput").on("input", function () {
        const keyword = $(this).val().trim();
        if (keyword.length < 2) { 
            $("#searchResults").empty(); 
            return; 
        }
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => searchTechnician(keyword), 500);
    });

    // Submit rating
    $("#ratingForm").submit(async function (e) {
        e.preventDefault();
        if (!selectedTechnicianId) return Swal.fire("Info", "Please select a technician first!", "info");
        if (selectedRating === 0) return Swal.fire("Info", "Please select a star rating!", "info");

        const payload = {
            technicianId: selectedTechnicianId,
            userId: CURRENT_USER_ID,
            stars: selectedRating,
            comment: $("#comment").val().trim(),
            requestId: selectedRequestId || 0
        };

        $("#submitBtn").prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Submitting...');

        try {
            const res = await fetch(RATINGS_URL, {
                method: "POST",
                headers: { "Authorization": `Bearer ${JWT}`, "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw res;

            $("#submitBtn").prop("disabled", false).html('<i class="fas fa-paper-plane me-2"></i>Submit Review');
            addActivity("Submitted Review", "New", "You submitted a review for a technician.");
            Swal.fire({ icon: "success", title: "Success!", text: "Your review has been submitted.", timer: 2000, showConfirmButton: false });

            resetForm();
            fetchReviews(selectedTechnicianId);

            // Clear service request info after rating
            localStorage.removeItem("selectedRequestId");
            localStorage.removeItem("selectedTechnicianId");

        } catch (err) {
            $("#submitBtn").prop("disabled", false).html('<i class="fas fa-paper-plane me-2"></i>Submit Review');
            let msg = "Failed to submit review";
            try { const errData = await err.json(); if (errData.message) msg = errData.message; } catch {}
            Swal.fire("Error!", msg, "error");
        }
    });

    // Clear form
    $("#clearBtn").click(resetForm);
});

// -------------------- Functions -------------------- //

function resetForm() {
    $("#comment").val(""); 
    $("#charCount").text("0");
    selectedRating = 0; 
    ratingLocked = false;
    highlightStars(0);
    updateRatingLabel(0);
}

// Highlight stars
function highlightStars(rating) {
    $(".star").each(function () {
        const val = $(this).data("value");
        if (val <= rating) {
            $(this).removeClass("fa-regular").addClass("fa-solid text-warning");
        } else {
            $(this).removeClass("fa-solid text-warning").addClass("fa-regular");
        }
    });
}

// Update rating label
function updateRatingLabel(rating) {
    const labels = ["Not rated", "Poor", "Fair", "Good", "Very Good", "Excellent"];
    $("#ratingLabel").text(labels[rating]);
}

// Fetch technician by ID (fixed)
async function selectTechnicianById(technicianId) {
    try {
        const res = await fetch(`${BASE_URL}/user/get/${technicianId}`, { 
            headers: { "Authorization": `Bearer ${JWT}` }
        });
        if (!res.ok) throw res;
        const responseData = await res.json();
        if (responseData && responseData.data) {
            selectTechnician(responseData.data);
        } else {
            Swal.fire("Error", "Technician not found", "error");
        }
    } catch (err) {
        console.error("Fetch technician error:", err);
        // Swal.fire("Error", "Failed to load technician", "error");
    }
}


// Search technician by keyword
async function searchTechnician(keyword) {
    $("#loadingSpinner").removeClass("d-none");
    $("#searchResults").empty();

    try {
        const res = await fetch(`${SEARCH_TECH_URL}${encodeURIComponent(keyword)}`, {
            headers: { "Authorization": `Bearer ${JWT}` }
        });
        if (!res.ok) throw res;
        const data = await res.json();
        $("#loadingSpinner").addClass("d-none");

        if (data && data.data && data.data.length > 0) {
            data.data.forEach(tech => {
                const item = $(`

                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" data-id="${tech.userId}">
                        <div>
                            <strong>${tech.userFullName}</strong>
                            <div class="small text-muted">${tech.userDepartment || 'No department'} • ${tech.city || 'Unknown location'}</div>
                        </div>
                        <span class="badge bg-primary rounded-pill">Select</span>
                    </button>
                `);
                item.click(() => selectTechnician(tech));
                $("#searchResults").append(item);
            });
        } else {
            $("#searchResults").html('<div class="text-muted p-3 text-center">No technicians found</div>');
        }
    } catch (err) {
        $("#loadingSpinner").addClass("d-none");
        console.error("Search error:", err);
        let msg = "Error searching technicians";
        if (err.status === 401) {
            msg = "Session expired. Please log in again.";
            setTimeout(() => window.location.href = '/Front_End/pages/login.html', 2000);
        }
        $("#searchResults").html(`<div class="text-danger p-3 text-center">${msg}</div>`);
    }
}

// Select technician and update UI
function selectTechnician(tech) {
    selectedTechnicianId = tech.userId;
    $("#ratingSection, #reviewsSection").removeClass("d-none");

    $("#techName").text(tech.userFullName);
    $("#techDepartment").text(tech.userDepartment || tech.departmentName || "No department specified");
    $("#techLocation").text(tech.city || "Location not specified");

    const avatarUrl = tech.userImgURL || "/Front_End/assets/img/default-user.jpeg";
    $("#techAvatar").attr("src", avatarUrl);

    resetForm();
    fetchReviews(tech.userId);
}

// Fetch and display reviews
async function fetchReviews(technicianId) {
    $("#loadingSpinner").removeClass("d-none");
    $("#reviewsList").html('<div class="text-center py-4 text-muted"><div class="spinner-border text-primary"></div><p>Loading reviews...</p></div>');

    try {
        const res = await fetch(`${RATINGS_URL}/technician/${technicianId}`, {
            headers: { "Authorization": `Bearer ${JWT}` }
        });
        if (!res.ok) throw res;
        const data = await res.json();
        const reviews = data.data || data;

        $("#loadingSpinner").addClass("d-none");

        if (reviews.length > 0) {
            $("#reviewsList").empty();

            for (const r of reviews) {
                // Fetch reviewer info
                let reviewer = { userFullName: "Anonymous", userImgURL: "/Front_End/assets/img/default-user.jpeg" };
                try {
                    const userRes = await fetch(`${BASE_URL}/user/get/${r.userId}`, { headers: { "Authorization": `Bearer ${JWT}` } });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        if (userData && userData.data) reviewer = userData.data;
                    }
                } catch {}

                const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '';
                
                // Build review card
                const reviewItem = $(`
                    <div class="card mb-3 shadow-sm review-card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-2">
                                <img src="${reviewer.userImgURL || '/Front_End/assets/img/default-user.jpeg'}" 
                                     class="rounded-circle me-3" width="50" height="50" />
                                <div>
                                    <strong class="d-block">${reviewer.userFullName || "Anonymous"}</strong>
                                    <small class="text-muted">${date}</small>
                                </div>
                                <div class="ms-auto text-warning fs-5">
                                    ${"★".repeat(r.stars) + "☆".repeat(5 - r.stars)}
                                </div>
                            </div>
                            <p class="mb-0 text-secondary">${r.comment || "No comment provided"}</p>
                        </div>
                    </div>
                `);

                $("#reviewsList").append(reviewItem);
            }
        } else {
            $("#reviewsList").html('<div class="text-center py-4 text-muted"><i class="fas fa-comments fa-2x mb-2"></i><p>No reviews yet for this technician</p></div>');
        }
    } catch (err) {
        $("#loadingSpinner").addClass("d-none");
        console.error("Fetch reviews error:", err);
        $("#reviewsList").html(`<div class="text-danger p-3 text-center">Failed to load reviews</div>`);
    }
}
