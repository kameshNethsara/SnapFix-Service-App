$(document).ready(function() {
    const topbar = ` 
    <!-- Top Bar -->
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
                        <!-- AD -->
                        <!-- after set img and text how show that on dashboard -->
                        <img src="/Front_End/images/user-avatar.jpg" alt="User Avatar" class="img-fluid rounded-circle" id="user-avatar-img">
                    </div>
                    <div>
                          <a href="/Front_End/html/pages/user-profile.html">
                            <div class="fw-semibold">Admin User</div>
                          </a>
                        <div class="text-muted small">Administrator</div>
                    </div>
                </div>
                <!-- Logout Button -->
                <a href="/Front_End/html/login.html" class="btn btn-outline-danger ms-3 logout-btn">
                    <i class="fas fa-sign-out-alt me-1"></i>Logout
                </a>
            </div>
        </div>
    `

    document.getElementById('topbar').innerHTML = topbar;
});