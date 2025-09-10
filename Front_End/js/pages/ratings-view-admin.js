// ================== CONFIG ==================
const BASE_URL = "http://localhost:8080/snapfix";
const SEARCH_TECH_URL = `${BASE_URL}/user/search/name/`;
const RATINGS_URL = `${BASE_URL}/ratings`;

// ================== STATE ==================
let JWT = localStorage.getItem("jwtToken");
let CURRENT_USER_ID = localStorage.getItem("userId");
let selectedTechnicianId = null;
let selectedRating = 0;
let ratingLocked = false;
let searchTimeout = null;
let ratingsTable = null;

// From service request context (optional)
const storedTechnicianId = localStorage.getItem("selectedTechnicianId");

// ================== MAIN ==================
$(document).ready(function () {
    // Authentication check
    if (!JWT || !CURRENT_USER_ID) {
        Swal.fire({
            icon: "error",
            title: "Authentication Required",
            text: "Please log in to continue",
            willClose: () => (window.location.href = "/Front_End/html/login.html"),
        });
        return;
    }

    // Load technician automatically if coming from service request
    if (storedTechnicianId) {
        selectTechnicianById(storedTechnicianId);
    }

    // Star hover & click
    $("#starRow")
        .on("mouseenter", ".star", function () {
            if (!ratingLocked) {
                const val = $(this).data("value");
                highlightStars(val);
                updateRatingLabel(val);
            }
        })
        .on("mouseleave", ".star", function () {
            if (!ratingLocked) {
                highlightStars(selectedRating);
                updateRatingLabel(selectedRating);
            }
        })
        .on("click", ".star", function () {
            selectedRating = $(this).data("value");
            highlightStars(selectedRating);
            updateRatingLabel(selectedRating);
            ratingLocked = true;
        });

    // Technician search
    $("#searchTechBtn").click(() => {
        const keyword = $("#searchTechInput").val().trim();
        if (!keyword) return Swal.fire("Info", "Please enter a technician name to search", "info");
        searchTechnician(keyword);
    });

    $("#searchTechInput").keypress((e) => {
        if (e.which === 13) {
            const keyword = $("#searchTechInput").val().trim();
            if (keyword) searchTechnician(keyword);
        }
    });

    $("#searchTechInput").on("input", function () {
        const keyword = $(this).val().trim();
        if (keyword.length < 2) {
            $("#searchResults").empty();
            return;
        }
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => searchTechnician(keyword), 500);
    });

    // Load all ratings table on page ready
    loadAllRatings();
});

// ================== FUNCTIONS ==================

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

// Fetch technician by ID
async function selectTechnicianById(technicianId) {
    try {
        const res = await fetch(`${BASE_URL}/user/get/${technicianId}`, {
            headers: { Authorization: `Bearer ${JWT}` },
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
        Swal.fire("Error", "Failed to load technician", "error");
    }
}

// Search technician by keyword
async function searchTechnician(keyword) {
    $("#loadingSpinner").removeClass("d-none");
    $("#searchResults").empty();

    try {
        const res = await fetch(`${SEARCH_TECH_URL}${encodeURIComponent(keyword)}`, {
            headers: { Authorization: `Bearer ${JWT}` },
        });
        if (!res.ok) throw res;
        const data = await res.json();
        $("#loadingSpinner").addClass("d-none");

        if (data && data.data && data.data.length > 0) {
            data.data.forEach((tech) => {
                const item = $(`
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" data-id="${tech.userId}">
                        <div>
                            <strong>${tech.userFullName}</strong>
                            <div class="small text-muted">${tech.userDepartment || "No department"} • ${tech.city || "Unknown location"}</div>
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
            setTimeout(() => (window.location.href = "/Front_End/pages/login.html"), 2000);
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

    selectedRating = 0;
    ratingLocked = false;
    highlightStars(0);
    updateRatingLabel(0);

    fetchReviews(tech.userId);
    fetchAverageRating(tech.userId);
}

// Fetch and display reviews
async function fetchReviews(technicianId) {
    $("#loadingSpinner").removeClass("d-none");
    $("#reviewsList").html('<div class="text-center py-4 text-muted"><div class="spinner-border text-primary"></div><p>Loading reviews...</p></div>');

    try {
        const res = await fetch(`${RATINGS_URL}/technician/${technicianId}`, {
            headers: { Authorization: `Bearer ${JWT}` },
        });
        if (!res.ok) throw res;
        const data = await res.json();
        const reviews = data.data || data;

        $("#loadingSpinner").addClass("d-none");

        if (reviews.length > 0) {
            $("#reviewsList").empty();

            for (const r of reviews) {
                let reviewer = { userFullName: "Anonymous", userImgURL: "/Front_End/assets/img/default-user.jpeg" };
                try {
                    const userRes = await fetch(`${BASE_URL}/user/get/${r.userId}`, { headers: { Authorization: `Bearer ${JWT}` } });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        if (userData && userData.data) reviewer = userData.data;
                    }
                } catch {}

                const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "";

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

// Fetch and display average rating for a technician
async function fetchAverageRating(technicianId) {
    try {
        const res = await fetch(`${RATINGS_URL}/technician/${technicianId}`, {
            headers: { Authorization: `Bearer ${JWT}` },
        });
        if (!res.ok) throw res;
        const data = await res.json();
        const reviews = data.data || data;

        if (reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length;
            highlightStars(Math.round(avgRating));
            updateRatingLabel(Math.round(avgRating));
        } else {
            highlightStars(0);
            updateRatingLabel(0);
        }
    } catch (err) {
        console.error("Fetch average rating error:", err);
        highlightStars(0);
        updateRatingLabel(0);
    }
}

// ================== RATINGS TABLE ==================
async function loadAllRatings() {
    $("#loadingSpinner").removeClass("d-none");

    try {
        const res = await fetch(`${RATINGS_URL}`, {
            headers: { Authorization: `Bearer ${JWT}` },
        });
        if (!res.ok) throw res;
        const data = await res.json();
        const ratings = data.data || data;

        // Map table data
        const tableData = await Promise.all(ratings.map(async (r, index) => {
            // Technician
            let tech = { userFullName: "Unknown" };
            try {
                const techRes = await fetch(`${BASE_URL}/user/get/${r.technicianId}`, { headers: { Authorization: `Bearer ${JWT}` } });
                if (techRes.ok) {
                    const techData = await techRes.json();
                    if (techData && techData.data) tech = techData.data;
                }
            } catch {}

            // User
            let user = { userFullName: "Anonymous" };
            try {
                const userRes = await fetch(`${BASE_URL}/user/get/${r.userId}`, { headers: { Authorization: `Bearer ${JWT}` } });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    if (userData && userData.data) user = userData.data;
                }
            } catch {}

            return [
                r.ratingId,          // hidden
                index + 1,           // row number
                tech.userFullName,
                user.userFullName,
                r.stars,
                r.comment || "",
                r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
                `<button class="btn btn-sm btn-danger delete-btn ms-2" data-id="${r.ratingId}"><i class="fas fa-trash-alt"></i></button>`
            ];
        }));

        // Initialize or refresh DataTable
        if ($.fn.DataTable.isDataTable("#ratingsTable")) {
            ratingsTable.clear().rows.add(tableData).draw();
        } else {
            ratingsTable = $("#ratingsTable").DataTable({
                data: tableData,
                columns: [
                    { title: "Rating ID", visible: false }, // hidden
                    { title: "#" },
                    { title: "Technician" },
                    { title: "User" },
                    { title: "Stars" },
                    { title: "Comment" },
                    { title: "Date" },
                    { title: "Actions", orderable: false, searchable: false }
                ],
                paging: true,
                searching: true,
                info: true,
                ordering: true,
                autoWidth: false,
                scrollY: false,
                scrollCollapse: false
            });
        }

        $("#loadingSpinner").addClass("d-none");
    } catch (err) {
        $("#loadingSpinner").addClass("d-none");
        console.error("Load ratings error:", err);
        Swal.fire("Error", "Failed to load ratings", "error");
    }
}

// Delete rating
$(document).on("click", ".delete-btn", async function () {
    const ratingId = $(this).data("id");
    const confirmed = await Swal.fire({
        icon: "warning",
        title: "Delete Rating?",
        text: "This action cannot be undone.",
        showCancelButton: true,
        confirmButtonText: "Delete",
    });

    if (confirmed.isConfirmed) {
        try {
            const res = await fetch(`${RATINGS_URL}/${ratingId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${JWT}` },
            });
            if (!res.ok) throw res;
            addActivity("Deleted Review", "Delete", "You deleted a review for a technician.");
            Swal.fire("Deleted!", "Rating deleted successfully.", "success");
            loadAllRatings();
        } catch (err) {
            console.error("Delete rating error:", err);
            Swal.fire("Error", "Failed to delete rating", "error");
        }
    }
});

// Edit rating (placeholder)
//i remove that function
$(document).on("click", ".edit-btn", function () {
    const ratingId = $(this).data("id");
    addActivity("Edited Review", "Edit", "You edited a review for a technician.");
    Swal.fire("Edit feature", `You can implement an edit form for rating ID ${ratingId}`, "info");
});
