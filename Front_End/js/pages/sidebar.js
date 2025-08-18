document.addEventListener('DOMContentLoaded', function () {
  const role = localStorage.getItem("role")?.toUpperCase();
  let sidebar = '';

  if (role && role === "USER") {
    sidebar = `
      <!-- User Sidebar -->
      <div class="sidebar">
        <div class="sidebar-header d-flex align-items-center">
          <div class="bg-warning rounded p-2 me-2">
            <i class="fas fa-home text-dark fs-4"></i>
          </div>
          <h3 class="m-0">SnapFix</h3>
        </div>
        <div class="sidebar-menu">
          <a href="/Front_End/html/pages/dashboard.html" class="menu-item active">
            <i class="fas fa-home"></i><span>Dashboard</span>
          </a>
          <a href="/Front_End/html/pages/serviceRequests.html" class="menu-item">
            <i class="fas fa-tools"></i><span>Service Requests</span>
          </a>
          <a href="/Front_End/html/pages/technicians.html" class="menu-item">
            <i class="fas fa-user-cog"></i><span>Technicians</span>
          </a>
          <a href="/Front_End/html/pages/services.html" class="menu-item">
            <i class="fas fa-concierge-bell"></i><span>Services</span>
          </a>
          <a href="/Front_End/html/pages/locations.html" class="menu-item">
            <i class="fas fa-map-marker-alt"></i><span>Locations</span>
          </a>
          <a href="/Front_End/html/pages/jobAssignment.html" class="menu-item">
            <i class="fas fa-tasks"></i><span>Job Assignment</span>
          </a>
          <a href="/Front_End/html/pages/ratings.html" class="menu-item">
            <i class="fas fa-star"></i><span>Ratings</span>
          </a>
          <a href="/Front_End/html/pages/payments.html" class="menu-item">
            <i class="fas fa-credit-card"></i><span>Payments</span>
          </a>
          <a href="/Front_End/html/pages/schedule.html" class="menu-item">
            <i class="fas fa-calendar-alt"></i><span>Schedule</span>
          </a>
          <a href="/Front_End/html/pages/user-profile.html" class="menu-item">
            <i class="fas fa-user-cog"></i><span>Profile Settings</span>
          </a>
        </div>
      </div>
    `;
  } else if (role && role === "ADMIN") {
    sidebar = `
      <!-- Admin Sidebar -->
      <div class="sidebar">
        <div class="sidebar-header d-flex align-items-center">
          <div class="bg-warning rounded p-2 me-2">
            <i class="fas fa-home text-dark fs-4"></i>
          </div>
          <h3 class="m-0">SnapFix</h3>
        </div>
        <div class="sidebar-menu">
          <a href="/Front_End/html/pages/dashboard.html" class="menu-item active">
            <i class="fas fa-home"></i><span>Dashboard</span>
          </a>
          <a href="/Front_End/html/pages/serviceRequests.html" class="menu-item">
            <i class="fas fa-tools"></i><span>Service Requests</span>
          </a>
          <a href="/Front_End/html/pages/Users.html" class="menu-item">
            <i class="fas fa-user-cog"></i><span>Users</span>
          </a>
          <a href="/Front_End/html/pages/services.html" class="menu-item">
            <i class="fas fa-concierge-bell"></i><span>Services</span>
          </a>
          <a href="/Front_End/html/pages/locations.html" class="menu-item">
            <i class="fas fa-map-marker-alt"></i><span>Locations</span>
          </a>
          <a href="/Front_End/html/pages/jobAssignment.html" class="menu-item">
            <i class="fas fa-tasks"></i><span>Job Assignment</span>
          </a>
          <a href="/Front_End/html/pages/ratings.html" class="menu-item">
            <i class="fas fa-star"></i><span>Ratings</span>
          </a>
          <a href="/Front_End/html/pages/payments.html" class="menu-item">
            <i class="fas fa-credit-card"></i><span>Payments</span>
          </a>
          <a href="/Front_End/html/pages/schedule.html" class="menu-item">
            <i class="fas fa-calendar-alt"></i><span>Schedule</span>
          </a>
          <a href="/Front_End/html/pages/user-profile.html" class="menu-item">
            <i class="fas fa-user-cog"></i><span>Profile Settings</span>
          </a>
        </div>
      </div>
    `;
  } else {
    // default sidebar or empty
    sidebar = '<div class="sidebar"><p>No role assigned.</p></div>';
  }

  // Set sidebar HTML once role check is done
  document.getElementById('sidebar').innerHTML = sidebar;

  // Now add the menu active state and keyboard nav logic
  const menuItems = document.querySelectorAll('.menu-item');

  // Auto-set active menu item based on current URL
  menuItems.forEach(item => {
    if (item.href === window.location.href) {
      item.classList.add('active');
    }
  });

  // Keyboard navigation (ignore when typing in inputs/textareas)
  let focusedIndex = 0;

  // Highlight first by default if none active
  if (!document.querySelector('.menu-item.active')) {
    menuItems[focusedIndex].classList.add('keyboard-focus');
    menuItems[focusedIndex].focus();
  } else {
    focusedIndex = Array.from(menuItems).indexOf(document.querySelector('.menu-item.active'));
  }

  document.addEventListener('keydown', function (e) {
    const activeElement = document.activeElement;
    const isTyping =
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable;

    if (isTyping) return; // Skip nav while typing

    menuItems[focusedIndex].classList.remove('keyboard-focus');

    if (e.key === 'ArrowDown') {
      focusedIndex = (focusedIndex + 1) % menuItems.length;
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      focusedIndex = (focusedIndex - 1 + menuItems.length) % menuItems.length;
      e.preventDefault();
    } else if (e.key === 'Enter') {
      menuItems[focusedIndex].click();
    }

    menuItems[focusedIndex].classList.add('keyboard-focus');
    menuItems[focusedIndex].focus();
  });
});
