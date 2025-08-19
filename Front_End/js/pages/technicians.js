$(document).ready(function() {
  const apiUrl = "http://localhost:8080/snapfix/user/getall";
  const token = localStorage.getItem("jwtToken"); // JWT token

  // Load all technicians
  async function loadTechnicians() {
    const container = $("#technician-cards");
    container.empty();

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
      const technicians = users.filter(user => user.userRole?.toUpperCase() === "TECHNICIAN");
      // const technicians = users.filter(user => user.userRole && user.userRole.toUpperCase() === "USER");

      if (technicians.length === 0) {
        container.html("<p>No technicians found.</p>");
        return;
      }

      technicians.forEach(tech => {
        const rating = tech.rating || 0;
        let starsHtml = "";
        for (let j = 1; j <= 5; j++) {
          starsHtml += j <= rating 
            ? `<i class="fas fa-star text-warning"></i>` 
            : `<i class="far fa-star text-warning"></i>`;
        }

        const isAvailable = tech.available === true || tech.available === "true";
        const availabilityBadge = isAvailable
          ? `<span class="badge bg-success">Available</span>`
          : `<span class="badge bg-danger">Unavailable</span>`;

        const requestButton = isAvailable
          ? `<button class="btn btn-primary btn-sm request-btn" data-id="${tech.userId}">Request</button>`
          : `<button class="btn btn-secondary btn-sm" disabled>Not Available</button>`;

        const imageURL = tech.userImgURL || '/Front_End/images/default-tech.jpg';

        const cardHtml = `
          <div class="col-md-4 mb-4">
            <div class="card shadow-sm">
              <img 
                src="${imageURL}" 
                class="card-img-top" 
                alt="${tech.userFullName}" 
                onerror="this.src='/Front_End/images/default-tech.jpg'"
              >
              <div class="card-body">
                <h5 class="card-title">${tech.userFullName} ${availabilityBadge}</h5>
                <p>${starsHtml}</p>
                <p><i class="fas fa-phone"></i> ${tech.userMobile}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${tech.city}</p>
                <p>${tech.description || ''}</p>
                ${requestButton}
              </div>
            </div>
          </div>
        `;
        container.append(cardHtml);
      });

      $(".request-btn").off("click").on("click", function() {
        const techId = $(this).data("id");
        Swal.fire({
          title: "Confirm Request",
          text: `Send request to technician ID: ${techId}?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, send request",
        }).then((result) => {
          if (result.isConfirmed) sendRequestToTechnician(techId);
        });
      });

    } catch (err) {
      console.error("Error loading technicians:", err);
      container.html("<p>Failed to load technicians.</p>");
    }
  }

  // Send service request to technician
  async function sendRequestToTechnician(techId) {
    try {
      const res = await fetch(`http://localhost:8080/snapfix/requests/send/${techId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data = await res.json();
      Swal.fire("Success!", data.message || "Request sent!", "success");

    } catch (err) {
      console.error("Error sending request:", err);
      Swal.fire("Error!", err.message || "Request failed!", "error");
    }
  }

  // // Update technician profile (with optional image)
  // async function updateTechnician(userObj, fileInput) {
  //   const formData = new FormData();
  //   formData.append("user", new Blob([JSON.stringify(userObj)], { type: "application/json" }));

  //   if (fileInput && fileInput.files[0]) {
  //     formData.append("profileImage", fileInput.files[0]);
  //   }

  //   try {
  //     const res = await fetch("http://localhost:8080/snapfix/user/updateTech", {
  //       method: "PUT",
  //       headers: {
  //         "Authorization": `Bearer ${token}`
  //       },
  //       body: formData
  //     });

  //     if (!res.ok) throw new Error(`Update failed with status ${res.status}`);
  //     const data = await res.json();
  //     Swal.fire("Success!", data.message || "Profile updated!", "success");

  //     // Reload technicians after update
  //     loadTechnicians();

  //   } catch (err) {
  //     console.error("Error updating technician:", err);
  //     Swal.fire("Error!", err.message || "Update failed!", "error");
  //   }
  // }

  loadTechnicians();
});
