document.addEventListener('DOMContentLoaded', function () {
    const sidebar = `
    
    <!-- Sidebar -->

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
    `
  document.getElementById('sidebar').innerHTML = sidebar;
  
   // navigation logic
  setTimeout(() => {
    const menuItems = document.querySelectorAll('.menu-item');
    let focusedIndex = 0;

    // Highlight first by default
    menuItems[focusedIndex].classList.add('keyboard-focus');
    menuItems[focusedIndex].focus();

    document.addEventListener('keydown', function (e) {
      // Remove previous focus style
      menuItems[focusedIndex].classList.remove('keyboard-focus');

      if (e.key === 'ArrowDown') {
        focusedIndex = (focusedIndex + 1) % menuItems.length;
      } else if (e.key === 'ArrowUp') {
        focusedIndex = (focusedIndex - 1 + menuItems.length) % menuItems.length;
      } else if (e.key === 'Enter') {
        menuItems[focusedIndex].click();
      }

      // Add focus to new item
      menuItems[focusedIndex].classList.add('keyboard-focus');
      menuItems[focusedIndex].focus();
    });
  }, 100); // wait for DOM injection
});