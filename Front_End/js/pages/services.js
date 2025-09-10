$(document).ready(function () {
  const API_BASE = "http://localhost:8080";
  const SR_ENDPOINT = "/snapfix/service-requests";
  const USERS_ENDPOINT = "/snapfix/user/getall";

  let servicesData = [];
  let usersData = [];

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

  const jwtToken = localStorage.getItem("jwtToken") || "";

  // ================= FETCH SERVICES =================
  async function fetchServices() {
    try {
      const res = await fetch(API_BASE + SR_ENDPOINT + "/getAllRequests", {
        headers: { "Authorization": "Bearer " + jwtToken }
      });
      if (!res.ok) throw new Error("Failed to fetch service requests");

      const data = await res.json();
      servicesData = Array.isArray(data) ? data : [];
      populateTable(servicesData);
      updateServiceStats(servicesData); // update stats
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  }

  // ================= FETCH USERS =================
  async function fetchUsers() {
    try {
      const res = await fetch(API_BASE + USERS_ENDPOINT, {
        headers: { "Authorization": "Bearer " + jwtToken }
      });
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      usersData = Array.isArray(data.data) ? data.data : [];
      populateTechnicianDropdown();
    } catch (err) {
      console.error("Error fetching users:", err);
      usersData = [];
      populateTechnicianDropdown();
    }
  }

  // ================= HELPERS =================
  function isTechnician(u) {
    const role = (u.role || u.userRole || u.type || "").toUpperCase();
    return role.includes("TECHNICIAN") || role === "TECH" || role === "ROLE_TECHNICIAN";
  }

  function getUserFullName(userId) {
    const user = usersData.find(u => (u.userId || u.id) == userId);
    return user ? (user.userFullName || user.userName || "Unknown User") : "Unknown User";
  }

  function getTechId(t) {
    return t.userId || t.id || t.technicianId || null;
  }

  function getTechFullName(t) {
    return t.userFullName || t.userName || ((t.firstName || "") + " " + (t.lastName || "")).trim() || (getTechId(t) ? "#" + getTechId(t) : "Unknown");
  }

  function escapeHtml(str) {
    return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function escapeAttr(str) {
    return (str + "").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function getStatusBadgeClass(status) {
    switch ((status || "").toUpperCase()) {
      case "PENDING": return "bg-warning text-dark";
      case "IN_PROGRESS": return "bg-info text-dark";
      case "COMPLETED": return "bg-success";
      case "CANCELLED": return "bg-danger";
      default: return "bg-secondary";
    }
  }

  function formatDateTime(dt) {
    if (!dt) return "N/A";
    try {
      return new Date(dt).toLocaleString();
    } catch {
      return dt;
    }
  }

  // ================= POPULATE TABLE =================
  function populateTable(data) {
    const tbody = $("#servicesTable tbody");
    tbody.empty();

    data.forEach((service, index) => {
      const reqId = service.id || service.requestId || service.requestID || "";
      const userId = service.userId || (service.user && service.user.id) || "";
      const userFullName = service.userFullName || getUserFullName(userId);
      const title = service.title || service.requestTitle || "-";
      const category = service.category || service.serviceCategory || "-";
      const city = service.city || (service.address && service.address.city) || "-";
      const phone = service.phone || service.contactNumber || (service.user && service.user.phone) || "-";
      const rawStatus = service.status || service.requestStatus || "-";
      const status = `<span class="badge ${getStatusBadgeClass(rawStatus)}">${escapeHtml(rawStatus)}</span>`;
      const preferredDateTime = formatDateTime(service.preferredDateTime);

      const technicianFullName = service.technicianName || (() => {
        if (service.technicianId) {
          const tech = usersData.find(u => u.userId === service.technicianId || u.id === service.technicianId);
          return tech ? tech.userFullName || tech.userName : "Unknown";
        }
        return null;
      })();

      const row = `
        <tr data-userid="${userId}">
          <td>${index + 1}</td>
          <td>${reqId}</td>
          <td>${userId}</td>
          <td>${escapeHtml(userFullName)}</td>
          <td>${escapeHtml(title)}</td>
          <td>${escapeHtml(category)}</td>
          <td>${escapeHtml(city)}</td>
          <td>${escapeHtml(phone)}</td>
          <td>${status}</td>
          <td data-techid="${service.technicianId || ''}">
            ${technicianFullName ? escapeHtml(technicianFullName) : "Not Assigned"}
          </td>
          <td>${preferredDateTime}</td>
          <td>
            <button class="btn btn-sm assign-btn ${rawStatus.toUpperCase() === "COMPLETED" ? "bg-success text-white" : "btn-primary"}"
                data-id="${reqId}"
                data-userid="${userId}" 
                data-title="${escapeAttr(title)}"
                data-status="${escapeAttr(rawStatus)}"
                data-preferred="${escapeAttr(preferredDateTime)}"
                ${rawStatus.toUpperCase() === "COMPLETED" ? "disabled" : ""}>
                Assign
            </button>
          </td>
        </tr>`;
      tbody.append(row);
    });

    // Hide hidden columns
    $("#servicesTable thead th:eq(1), #servicesTable thead th:eq(2)").hide();
    $("#servicesTable tbody tr").each(function () {
      $(this).find("td:eq(1), td:eq(2)").hide();
    });
  }

  // ================= POPULATE TECH DROPDOWN =================
  function populateTechnicianDropdown() {
    const dropdown = $("#technicianSelect");
    const currentTechId = dropdown.data("currentTechId") || "";

    dropdown.empty();
    dropdown.append('<option value="" disabled>-- Select Technician --</option>');

    usersData
      .filter(tech => (isTechnician(tech) && tech.availability === true) || getTechId(tech) == currentTechId)
      .forEach(tech => {
        const id = getTechId(tech);
        const name = getTechFullName(tech);
        if (id != null) {
          dropdown.append(
            `<option value="${id}" ${id == currentTechId ? "selected" : ""}>${escapeHtml(name)}</option>`
          );
        }
      });
  }

  // ================= ASSIGN BUTTON =================
  $(document).on("click", ".assign-btn", function () {
    const requestId = $(this).data("id");
    const title = $(this).data("title");
    const status = $(this).data("status");
    const preferred = $(this).data("preferred");

    const currentTechId = $(this).closest("tr").find("td:eq(9)").data("techid") || "";

    $("#currentRequestId").val(requestId);
    $("#modalRequestTitle").text(title);
    $("#modalRequestStatus").text(status);

    if ($("#modalRequestDateTime").length === 0) {
      $("#modalRequestStatus").after(`<p><strong>Preferred Date & Time:</strong> <span id="modalRequestDateTime"></span></p>`);
    }
    $("#modalRequestDateTime").text(preferred || "Not Provided");

    $("#technicianSelect").data("currentTechId", currentTechId);

    $("#statusSelect").val(status || "PENDING");

    populateTechnicianDropdown();
    $("#technicianSelect").val(currentTechId);

    $("#mainContent").attr("inert", "");
    $("#assignTechnicianModal").modal("show");
  });

  $("#assignTechnicianModal").on('hidden.bs.modal', function () {
    $("#mainContent").removeAttr("inert");
  });

  // ================= SAVE ASSIGNMENT =================
  $("#saveAssignment").click(async function () {
    const requestId = $("#currentRequestId").val();
    const technicianId = $("#technicianSelect").val();
    const status = $("#statusSelect").val();

    if (!requestId) { Swal.fire("Error", "Invalid Request ID", "error"); return; }
    if (!technicianId) { Swal.fire("Error", "Please select a technician", "error"); return; }

    const payload = { technicianId: Number(technicianId), status: status };

    try {
      const res = await fetch(`${API_BASE + SR_ENDPOINT}/${encodeURIComponent(requestId)}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + jwtToken },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to assign technician");

      let newAvailability = !["PENDING", "IN_PROGRESS", "APPROVED"].includes(status.toUpperCase());

      await fetch(`${API_BASE}/snapfix/user/${newAvailability ? 'activateAvailability' : 'deactivateAvailability'}/${technicianId}`, {
        method: "PATCH",
        headers: { "Authorization": "Bearer " + jwtToken }
      });
      addActivity("Assigned Technician", "Assign", `You assigned technician ID #${technicianId} to service request ID #${requestId}.`);
      Swal.fire("Success", "Technician assigned successfully", "success");
      $("#assignTechnicianModal").modal("hide");
      await fetchServices(); // refresh table & stats
      await fetchUsers();    // refresh dropdown
    } catch (err) {
      Swal.fire("Error", err.message || err, "error");
    }
  });

  // ================= FILTERS =================
  $("#statusFilter,#categoryFilter,#cityFilter").on("input change", applyFilters);
  $("#resetFilters").click(function () {
    $("#statusFilter").val("");
    $("#categoryFilter").val("");
    $("#cityFilter").val("");
    populateTable(servicesData);
    updateServiceStats(servicesData);
  });

  function applyFilters() {
    const status = ($("#statusFilter").val() || "").toLowerCase();
    const category = ($("#categoryFilter").val() || "").toLowerCase();
    const city = ($("#cityFilter").val() || "").toLowerCase();

    const filtered = servicesData.filter(service => {
      const svStatus = (service.status || service.requestStatus || "").toLowerCase();
      const svCategory = (service.category || service.serviceCategory || "").toLowerCase();
      const svCity = (service.city || (service.address && service.address.city) || "").toLowerCase();
      return (!status || svStatus === status) && (!category || svCategory === category) && (!city || svCity.indexOf(city) >= 0);
    });
    populateTable(filtered);
    updateServiceStats(filtered); // update stats for filtered data
  }

  // ================= SERVICE STATS =================
  function updateServiceStats(data) {
    const total = data.length;
    const completed = data.filter(s => (s.status || s.requestStatus || "").toUpperCase() === "COMPLETED").length;
    const inProgress = data.filter(s => (s.status || s.requestStatus || "").toUpperCase() === "IN_PROGRESS").length;
    const approved = data.filter(s => (s.status || s.requestStatus || "").toUpperCase() === "APPROVED").length;
    const pending = data.filter(s => (s.status || s.requestStatus || "").toUpperCase() === "PENDING").length;
    const cancelled = data.filter(s => (s.status || s.requestStatus || "").toUpperCase() === "CANCELLED").length;

    $("#totalStatus").text(total);
    $("#completedCount").text(completed);
    $("#inProgressCount").text(inProgress);
    $("#approvedCount").text(approved);
    $("#pendingCount").text(pending);
    $("#cancelledCount").text(cancelled);
  }

  // ================= INITIAL FETCH =================
  fetchServices();
  fetchUsers();
});
