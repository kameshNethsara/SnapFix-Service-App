$(document).ready(function () {
    const topbar = `
        <div class="topbar d-flex flex-column flex-md-row align-items-center justify-content-between">
            <div class="d-flex align-items-center mb-3 mb-md-0">
                <button class="btn btn-primary me-3 d-md-none" id="menuToggle">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="search-bar d-flex align-items-center">
                    <i class="fas fa-search text-muted"></i>
                    <input type="text" placeholder="Search..." class="form-control ms-2" id="searchInput">
                </div>
            </div>
            <div class="d-flex align-items-center">
                <div class="notification position-relative me-4">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge">3</span>
                </div>
                <div class="d-flex align-items-center">
                    <div class="user-avatar me-2">
                        <img src="/Front_End/assets/img/default-user.jpeg" alt="User Avatar" class="img-fluid rounded-circle" id="user-avatar-img">
                    </div>
                    <div>
                        <a href="/Front_End/html/pages/user-profile.html">
                            <div class="fw-semibold" id="user-name">Admin User</div>
                        </a>
                        <div class="text-muted small" id="user-role">Administrator</div>
                    </div>
                </div>
                <a class="btn btn-outline-danger ms-3 logout-btn" onclick="logout()">
                    <i class="fas fa-sign-out-alt me-1"></i>Logout
                </a>
            </div>
        </div>
    `;

    document.getElementById('topbar').innerHTML = topbar;

    // ✅ Now call this AFTER topbar is injected
    showUserDetails();
});

function showUserDetails() {
    const userName = localStorage.getItem("username") || "Admin User";
    const userRole = localStorage.getItem("role") || "Administrator";
    const userImgURL = localStorage.getItem("userImgURL") || "/Front_End/assets/img/default-user.jpeg";
    
    const nameElement = document.getElementById("user-name");
    if (nameElement) nameElement.textContent = userName;

    const roleElement = document.getElementById("user-role");
    if (roleElement) roleElement.textContent = userRole;

    const avatarElement = document.getElementById("user-avatar-img");
    if (avatarElement) avatarElement.src = userImgURL;

    // Optional: if userImgURL is empty or invalid, use default image
    avatarElement.onerror = function() {
        avatarElement.src = "/Front_End/assets/img/default-user.jpeg";
    };
}

// function logout() {
//     localStorage.removeItem("jwtToken");
//     localStorage.removeItem("username");
//     localStorage.removeItem("role");
//     window.location.href = "/Front_End/html/login.html";
// }
function logout() {
    Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, logout!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear localStorage and redirect
            localStorage.clear();
            window.location.href = "/Front_End/html/login.html";
        }
    });
}

