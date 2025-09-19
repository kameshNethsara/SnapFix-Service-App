console.log("Script loaded");

// ================== CONFIG ==================
const BASE_URL = "http://localhost:8080/snapfix";
const JWT = localStorage.getItem("jwtToken");
const CURRENT_USER_ID = localStorage.getItem("userId");
const CURRENT_USER_NAME = localStorage.getItem("fullName") || "Admin";

// ================== AUTH & GEOLOCATION ==================
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

    // Set username in dashboard
    $("#dashboardUserName").text(CURRENT_USER_NAME);

    // Initialize dashboard
    initializeDashboard();

    // Event listeners
    $("#newUserBtn").click(() => {
        window.location.href = "/Front_End/html/pages/users.html";
    });
});

// Handle location updates only for USER/TECHNICIAN
window.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    console.log("User role:", role);

    if (role === "USER" || role === "TECHNICIAN") {
        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.permissions.query({ name: "geolocation" }).then(result => {
                    console.log("Geolocation permission state:", result.state);
                    if (result.state === "denied") {
                        console.error("Location access is blocked. Enable it in browser settings.");
                        return;
                    }

                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude, accuracy } = position.coords;
                            console.log("User Location:", latitude, longitude);
                            console.log("Accuracy (meters):", accuracy);

                            fetch(`${BASE_URL}/user/updateLocation`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${JWT}`,
                                },
                                body: JSON.stringify({
                                    userId: parseInt(CURRENT_USER_ID),
                                    latitude,
                                    longitude,
                                }),
                            })
                                .then(res => res.json())
                                .then(data => console.log("Location updated:", data))
                                .catch(err => console.error("Error updating location:", err));
                        },
                        (error) => console.error("Error getting location:", error),
                        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
                    );
                });
            } else {
                console.error("Geolocation is not supported by this browser.");
            }
        };

        updateLocation();
        setInterval(updateLocation, 300000); // every 5 mins
    }
});

// ================== DASHBOARD FUNCTIONS ==================
async function initializeDashboard() {
    try {
        await Promise.all([
            loadDashboardStats(),
            loadRecentActivity(),
            loadRecentRequests(),
            loadTopTechnicians(),
            initializeCharts(),
        ]);
    } catch (error) {
        console.error("Dashboard initialization error:", error);
        showError("Failed to load dashboard data");
    }
}

// Load statistics
async function loadDashboardStats() {
    try {
        const requestsRes = await fetch(`${BASE_URL}/service-requests/getAllRequests`, {
            headers: { Authorization: `Bearer ${JWT}` },
        });
        if (!requestsRes.ok) throw new Error("Failed to fetch service requests");
        const requestsData = await requestsRes.json();
        const allRequests = Array.isArray(requestsData) ? requestsData : [];

        const usersRes = await fetch(`${BASE_URL}/user/getall`, {
            headers: { Authorization: `Bearer ${JWT}` },
        });
        if (!usersRes.ok) throw new Error("Failed to fetch users");
        const usersData = await usersRes.json();
        const allUsers = Array.isArray(usersData.data) ? usersData.data : [];

        const totalRequests = allRequests.length;
        const pendingRequests = allRequests.filter(req => (req.status || "").toUpperCase() === "PENDING").length;
        const completedJobs = allRequests.filter(req => (req.status || "").toUpperCase() === "COMPLETED").length;
        const activeTechnicians = allUsers.filter(user =>
            (user.userRole || "").toUpperCase() === "TECHNICIAN" &&
            user.availability === true &&
            user.status === true
        ).length;

        $("#totalRequests").text(totalRequests);
        $("#pendingRequests").text(pendingRequests);
        $("#completedJobs").text(completedJobs);
        $("#activeTechnicians").text(activeTechnicians);
    } catch (error) {
        console.error("Error loading dashboard stats:", error);
        throw error;
    }
}

// Load recent activity (after connect to API later)
// async function loadRecentActivity() {
//     try {
//         const activities = getRecentActivities(10); // You must implement/get API

//         const activityList = $("#recentActivityList");
//         activityList.empty();

//         if (!activities || activities.length === 0) {
//             activityList.html(`
//                 <div class="text-center py-4 text-muted">
//                     <i class="fas fa-history fa-2x mb-2"></i>
//                     <p>No recent activity</p>
//                 </div>
//             `);
//             return;
//         }

//         activities.forEach(activity => {
//             const iconClass = getActivityIcon(activity.type);
//             const timeAgo = getTimeAgo(activity.timestamp);

//             const activityItem = `
//                 <div class="list-group-item border-0">
//                     <div class="d-flex align-items-start">
//                         <div class="me-3"><i class="${iconClass} fa-lg text-primary"></i></div>
//                         <div class="flex-grow-1">
//                             <h6 class="mb-1">${activity.title}</h6>
//                             <p class="mb-1 small text-muted">${activity.description}</p>
//                             <small class="text-muted">${timeAgo}</small>
//                         </div>
//                     </div>
//                 </div>
//             `;
//             activityList.append(activityItem);
//         });
//     } catch (error) {
//         console.error("Error loading recent activity:", error);
//         $("#recentActivityList").html(`
//             <div class="text-center py-4 text-danger">
//                 <i class="fas fa-exclamation-circle fa-2x mb-2"></i>
//                 <p>Failed to load activities</p>
//             </div>
//         `);
//     }
// }

function renderDashboardActivities(limit = 5) {
    const list = $("#recentActivityList");
    list.empty();

    const activities = JSON.parse(localStorage.getItem("activities")) || [];
    const recent = activities.slice(0, limit);

    if (recent.length === 0) {
        list.html(`<div class="text-center py-3 text-muted">No recent activity</div>`);
        return;
    }

    recent.forEach(act => {
        const item = `
            <div class="list-group-item border-0">
                <div class="d-flex align-items-start">
                    <div class="me-3"><i class="fas fa-circle text-${getBadgeColor(act.type)}"></i></div>
                    <div>
                        <strong>${act.action}</strong>
                        <p class="mb-0 small text-muted">${act.description}</p>
                        <small class="text-muted">${getTimeAgo(act.timestamp)}</small>
                    </div>
                </div>
            </div>
        `;
        list.append(item);
    });
}


// Recent activity (from localStorage)
// Load recent activity from localStorage
async function loadRecentActivity(limit = 10) {
    try {
        const activities = JSON.parse(localStorage.getItem("activities")) || [];
        const recent = activities.slice(0, limit);

        const activityList = $("#recentActivityList");
        activityList.empty();

        if (recent.length === 0) {
            activityList.html(`
                <div class="text-center py-4 text-muted">
                    <i class="fas fa-history fa-2x mb-2"></i>
                    <p>No recent activity</p>
                </div>
            `);
            return;
        }

        recent.forEach(activity => {
            const iconClass = getActivityIcon(activity.type);
            const timeAgo = getTimeAgo(activity.timestamp || activity.date);

            const activityItem = `
                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-start">
                    <div>
                        <div class="fw-bold">${activity.action || activity.title}</div>
                        <small class="text-muted">${activity.description}</small>
                        <div class="text-muted small">${timeAgo}</div>
                    </div>
                    <span class="badge bg-${getBadgeColor(activity.type)} rounded-pill">${activity.type}</span>
                </a>
            `;
            activityList.append(activityItem);
        });
    } catch (error) {
        console.error("Error loading recent activity:", error);
        $("#recentActivityList").html(`
            <div class="text-center py-4 text-danger">
                <i class="fas fa-exclamation-circle fa-2x mb-2"></i>
                <p>Failed to load activities</p>
            </div>
        `);
    }
}

// ================== LOCAL STORAGE ACTIVITIES ==================
// Add a new activity
function addActivity(action, type, description) {
    const now = new Date();
    const dateString = now.toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit"
    });

    const activity = { date: dateString, action, type, description };

    // Get existing activities and add new one at the start
    let activities = JSON.parse(localStorage.getItem("activities")) || [];
    activities.unshift(activity);
    localStorage.setItem("activities", JSON.stringify(activities));

    renderRecentActivity();
}

// Render activities to recent activity list
function renderRecentActivity() {
    const list = $("#recentActivityList");
    list.empty();

    const activities = JSON.parse(localStorage.getItem("activities")) || [];

    if (activities.length === 0) {
        list.append(`
            <div class="text-center py-4">
                <small class="text-muted">No recent activity</small>
            </div>
        `);
        return;
    }

    activities.forEach(act => {
        const item = `
            <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-start">
                <div>
                    <div class="fw-bold">${act.action}</div>
                    <small class="text-muted">${act.description}</small>
                </div>
                <span class="badge bg-${getBadgeColor(act.type)} rounded-pill">${act.type}</span>
            </a>
        `;
        list.append(item);
    });
}

// Load recent requests
async function loadRecentRequests() {
    try {
        const res = await fetch(`${BASE_URL}/service-requests/getAllRequests`, {
            headers: { Authorization: `Bearer ${JWT}` },
        });
        if (!res.ok) throw new Error("Failed to fetch service requests");
        const data = await res.json();
        const requests = Array.isArray(data) ? data : [];

        const recentRequests = requests
            .sort((a, b) => new Date(b.createdAt || b.requestDate) - new Date(a.createdAt || a.requestDate))
            .slice(0, 5);

        const tableBody = $("#recentRequestsTable tbody");
        tableBody.empty();

        if (recentRequests.length === 0) {
            tableBody.html(`
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        <i class="fas fa-clipboard-list fa-2x mb-2"></i>
                        <p>No service requests found</p>
                    </td>
                </tr>
            `);
            return;
        }

        recentRequests.forEach(request => {
            const requestId = request.requestId || request.id || "N/A";
            const title = request.title || "Untitled Request";
            const customerName = request.userFullName || "Unknown Customer";
            const technicianName = request.technicianName || "Unassigned";
            const status = request.status || "Unknown";
            const date = request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "Unknown";
            const statusBadge = `<span class="badge ${getStatusBadgeClass(status)}">${status}</span>`;

            tableBody.append(`
                <tr>
                    <td>#${requestId}</td>
                    <td>${title}</td>
                    <td>${customerName}</td>
                    <td>${technicianName}</td>
                    <td>${statusBadge}</td>
                    <td>${date}</td>
                </tr>
            `);
        });
    } catch (error) {
        console.error("Error loading recent requests:", error);
        $("#recentRequestsTable tbody").html(`
            <tr>
                <td colspan="6" class="text-center py-4 text-danger">
                    <i class="fas fa-exclamation-circle fa-2x mb-2"></i>
                    <p>Failed to load service requests</p>
                </td>
            </tr>
        `);
    }
}

// Load top technicians
async function loadTopTechnicians() {
    try {
        const res = await fetch(`${BASE_URL}/user/getall`, {
            headers: { Authorization: `Bearer ${JWT}` },
        });
        if (!res.ok) throw new Error("Failed to fetch technicians");
        const data = await res.json();
        const users = Array.isArray(data.data) ? data.data : [];

        const technicians = users
            .filter(user => (user.userRole || "").toUpperCase() === "TECHNICIAN")
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5);

        const techniciansList = $("#topTechniciansList");
        techniciansList.empty();

        if (technicians.length === 0) {
            techniciansList.html(`
                <div class="text-center py-4 text-muted">
                    <i class="fas fa-user-cog fa-2x mb-2"></i>
                    <p>No technicians found</p>
                </div>
            `);
            return;
        }

        technicians.forEach(tech => {
            const rating = tech.rating || 0;
            let starsHtml = "";
            for (let i = 1; i <= 5; i++) {
                starsHtml += i <= rating
                    ? '<i class="fas fa-star text-warning"></i>'
                    : '<i class="far fa-star text-warning"></i>';
            }
            const availabilityBadge = tech.availability
                ? '<span class="badge bg-success ms-2">Available</span>'
                : '<span class="badge bg-secondary ms-2">Busy</span>';

            techniciansList.append(`
                <div class="list-group-item border-0">
                    <div class="d-flex align-items-center">
                        <img src="${tech.userImgURL || '/Front_End/assets/img/default-user.jpeg'}" 
                             class="rounded-circle me-3" width="40" height="40" alt="${tech.userFullName}">
                        <div class="flex-grow-1">
                            <h6 class="mb-0">${tech.userFullName} ${availabilityBadge}</h6>
                            <div class="small">
                                ${starsHtml} <span class="ms-1">(${rating.toFixed(1)})</span>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });
    } catch (error) {
        console.error("Error loading top technicians:", error);
        $("#topTechniciansList").html(`
            <div class="text-center py-4 text-danger">
                <i class="fas fa-exclamation-circle fa-2x mb-2"></i>
                <p>Failed to load technicians</p>
            </div>
        `);
    }
}

// Initialize chart
async function initializeCharts() {
    try {
        const res = await fetch(`${BASE_URL}/service-requests/getAllRequests`, {
            headers: { Authorization: `Bearer ${JWT}` },
        });
        if (!res.ok) throw new Error("Failed to fetch chart data");
        const data = await res.json();
        const requests = Array.isArray(data) ? data : [];

        const last30Days = getLast30Days();
        const statusCounts = countRequestsByStatus(requests, last30Days);

        const ctx = document.getElementById("requestsChart").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: last30Days.map(date => date.toLocaleDateString("en-US", { month: "short", day: "numeric" })),
                datasets: [
                    { label: "Completed", data: statusCounts.completed, backgroundColor: "rgba(76, 175, 80, 0.7)", borderColor: "rgba(76, 175, 80, 1)", borderWidth: 1 },
                    { label: "In Progress", data: statusCounts.inProgress, backgroundColor: "rgba(33, 150, 243, 0.7)", borderColor: "rgba(33, 150, 243, 1)", borderWidth: 1 },
                    { label: "Pending", data: statusCounts.pending, backgroundColor: "rgba(255, 152, 0, 0.7)", borderColor: "rgba(255, 152, 0, 1)", borderWidth: 1 },
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: "Number of Requests" } },
                    x: { title: { display: true, text: "Date" } }
                },
                plugins: {
                    legend: { position: "top" },
                    title: { display: true, text: "Service Requests by Status (Last 30 Days)" }
                }
            }
        });
    } catch (error) {
        console.error("Error initializing charts:", error);
        $("#requestsChart").closest(".card-body").html(`
            <div class="text-center py-4 text-danger">
                <i class="fas fa-exclamation-circle fa-2x mb-2"></i>
                <p>Failed to load chart data</p>
            </div>
        `);
    }
}

// ================== UTILS ==================
function getStatusBadgeClass(status) {
    switch ((status || "").toUpperCase()) {
        case "PENDING": return "bg-warning";
        case "APPROVED": return "bg-info";
        case "IN_PROGRESS": return "bg-primary";
        case "COMPLETED": return "bg-success";
        case "CANCELLED": return "bg-danger";
        default: return "bg-secondary";
    }
}
function getActivityIcon(activityType) {
    switch (activityType) {
        case "Create": return "fas fa-plus-circle";
        case "Update": return "fas fa-edit";
        case "Delete": return "fas fa-trash-alt";
        case "Assign": return "fas fa-user-check";
        case "Select": return "fas fa-mouse-pointer";
        default: return "fas fa-history";
    }
}
// function getTimeAgo(timestamp) {
//     const now = new Date();
//     const diffMs = now - new Date(timestamp);
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);

//     if (diffMins < 1) return "Just now";
//     if (diffMins < 60) return `${diffMins} min ago`;
//     if (diffHours < 24) return `${diffHours} hr ago`;
//     if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
//     return new Date(timestamp).toLocaleDateString();
// }
function getBadgeColor(type) {
    switch(type?.toLowerCase()) {
        case "update": return "success";
        case "login": return "primary";
        case "support": return "warning";
        case "report": return "info";
        case "new": return "secondary";
        case "create": return "dark";
        default: return "dark";
    }
}

function getTimeAgo(timestamp) {
    if (!timestamp) return "Unknown time";
    const date = new Date(timestamp);
    if (isNaN(date)) return "Invalid time";

    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return date.toLocaleDateString();
}

function getLast30Days() {
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date);
    }
    return days;
}
function countRequestsByStatus(requests, days) {
    const statusCounts = { pending: Array(days.length).fill(0), inProgress: Array(days.length).fill(0), completed: Array(days.length).fill(0) };
    requests.forEach(request => {
        const requestDate = new Date(request.createdAt || request.requestDate);
        const dayIndex = days.findIndex(day =>
            day.getDate() === requestDate.getDate() &&
            day.getMonth() === requestDate.getMonth() &&
            day.getFullYear() === requestDate.getFullYear()
        );
        if (dayIndex !== -1) {
            const status = (request.status || "").toUpperCase();
            if (status === "PENDING") statusCounts.pending[dayIndex]++;
            else if (status === "IN_PROGRESS") statusCounts.inProgress[dayIndex]++;
            else if (status === "COMPLETED") statusCounts.completed[dayIndex]++;
        }
    });
    return statusCounts;
}
function showError(message) {
    Swal.fire({ icon: "error", title: "Error", text: message, timer: 3000, showConfirmButton: false });
}

// ================== AUTO REFRESH ==================
setInterval(initializeDashboard, 300000); // every 5 mins

// Dashboard card Trend updater
function updateTrend(statId, current, previous) {
    const trendDiv = document.getElementById(statId);
    const icon = trendDiv.querySelector('i');
    const text = trendDiv.querySelector('span');

    if(previous === 0) previous = 1; // Avoid divide by zero
    const diff = current - previous;
    const percentChange = ((diff / previous) * 100).toFixed(1);

    if(diff > 0) {
        trendDiv.className = 'trend up';
        icon.className = 'fas fa-arrow-up';
        icon.style.color = 'green';
        text.textContent = `${percentChange}% from yesterday`;
    } else if(diff < 0) {
        trendDiv.className = 'trend down';
        icon.className = 'fas fa-arrow-down';
        icon.style.color = 'red';
        text.textContent = `${Math.abs(percentChange)}% from yesterday`;
    } else {
        trendDiv.className = 'trend neutral';
        icon.className = 'fas fa-minus';
        icon.style.color = 'gray';
        text.textContent = 'No change';
    }
}
