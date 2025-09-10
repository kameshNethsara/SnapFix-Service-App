$(document).ready(function () {

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
    const userId = localStorage.getItem("userId");

    if (!userId) {
        Swal.fire("Error", "User ID not found. Please login again.", "error");
        return window.location.href = "/Front_End/html/login.html";
    }

    //user info character count
    $('#editUserInfo').on('input', function() {
      let length = $(this).val().length;
      $('#charCount').text(length + " / 250");
    });

    // Hide department field for regular users
    const role = localStorage.getItem("role")?.toUpperCase();
    if(role === "USER") {
        $('#editDepartment').val("N/A");
        $('#editDepartment').closest('.mb-3').hide();
    }

    // Load profile data
    fetchUserProfile(userId);
    showUserDetails();

    // Allow typing in input fields (force remove readonly/disabled if needed)
    enableFormInputs();

    // Common handler for avatar/profile picture uploads
    function handleImageUpload(inputSelector, successMessage) {
        $(inputSelector).on('change', function () {
            const file = this.files[0];
            if (!file) return;

            const oldUrl = $('#avatarImage').attr('src'); // backup current avatar

            const reader = new FileReader();
            reader.onload = function (e) {
                $('#avatarImage').attr('src', e.target.result); // preview
            };
            reader.readAsDataURL(file);

            // Upload to ImgBB
            uploadToImgBB(file)
                .then((url) => {
                    $('#avatarImage').attr('src', url).data('url', url); 
                    $('#profilePicture').data('url', url); 
                    $('#avatarUrl').val(url); 
                    Swal.fire('Uploaded! \n Now Click Update Profile ', successMessage, 'success').then(() => {
                        // Switch to Settings tab after upload
                        const settingsTab = new bootstrap.Tab(document.querySelector('a[href="#settings"]'));
                        settingsTab.show();
                    });
                })
                .catch((err) => {
                    console.error('Image upload failed:', err);
                    $('#avatarImage').attr('src', oldUrl); // restore old avatar
                    Swal.fire('Upload Failed', 'Failed to upload image. Keeping previous one.', 'error');
                });
        });
    }

    // Attach handlers
    handleImageUpload('#avatarUpload', 'Avatar updated successfully.');
    handleImageUpload('#profilePicture', 'Profile picture updated successfully.');

    // Handle Update Profile Button Click
    $('#updateProfileBtn').on('click', updateUserProfile);
    $('#updatePasswordBtn').on('click', updatePassword);
});

function fetchUserProfile(userId) {
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/snapfix/user/get/${userId}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(res => {
        const user = res.data;

        // Profile Tab
        $('#fullName').text(user.userFullName || 'N/A');
        $('#email').text(user.userEmail || 'N/A');
        $('#mobile').text(user.userMobile || 'N/A');
        $('#role').text(user.userRole || 'N/A');
        $('#location').text(`${user.street || ''}, ${user.city || ''}, ${user.postalCode || ''}`.trim());
        $('#department').text(user.userDepartment || 'N/A');
        $('#accessLevel').text(user.userRole?.toUpperCase() === 'ADMIN' ? 'Full Access' : 'Limited Access');
        $('#memberSince').text(user.userWhenCreated || 'N/A');
        $('#aboutMe').text(user.userInfo || 'No bio added');
        $('#avatarImage').attr('src', user.userImgURL || 'https://via.placeholder.com/120')
                         .data('url', user.userImgURL);

        // Settings Tab
        $('#editFullName').val(user.userFullName);
        $('#editEmail').val(user.userEmail);
        $('#editMobile').val(user.userMobile);
        $('#editUserInfo').val(user.userInfo);
        $('#editStreet').val(user.street);
        $('#editCity').val(user.city);
        $('#editPostalCode').val(user.postalCode);
        $('#editDepartment').val(user.userDepartment);
        $('#profilePicture').data('url', user.userImgURL);

        // Re-enable form fields just in case
        enableFormInputs();
    })
    .catch(err => {
        console.error(err);
        Swal.fire("Error", "Failed to load user profile.", "error");
    });
}

function uploadToImgBB(file) {
    const YOUR_IMGBB_API_KEY = "ba48954b39f744891fd598cf3b058597";
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("image", file);

        fetch("https://api.imgbb.com/1/upload?key="+YOUR_IMGBB_API_KEY, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            if (result?.data?.url) {
                resolve(result.data.url);
            } else {
                reject("Upload failed");
            }
        })
        .catch(error => reject(error));
    });
}

function updateUserProfile() {
    const token = localStorage.getItem("jwtToken");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    const userWhenCreated = localStorage.getItem("userWhenCreated");

    // Role eka uppercase karanna safety ekata
    const userRole = role ? role.toUpperCase() : "";

    // Edit Department hide/show logic (optional: you can do this outside the function on page load)
    // if (userRole === "USER") {
    //     $('#editDepartment').val("N/A");        // Department eka N/A karanna
    //     $('#editDepartment').closest('.mb-3').hide();  // Department input eka hide karanna
    // } else {
    //     $('#editDepartment').closest('.mb-3').show();  // Admin nam show karanna
    // }

    const updatedUser = {
        userId: parseInt(localStorage.getItem("userId")),
        userName: username,
        userRole: role,
        userWhenCreated: userWhenCreated,
        userImgURL: $('#profilePicture').data('url') || $('#avatarImage').data('url') || $('#avatarUrl').val() || "",
        userFullName: $('#editFullName').val(),
        userEmail: $('#editEmail').val(),
        userMobile: $('#editMobile').val(),
        userInfo: $('#editUserInfo').val(),
        street: $('#editStreet').val(),
        city: $('#editCity').val(),
        postalCode: $('#editPostalCode').val(),
        // userDepartment: $('#editDepartment').val()
        userDepartment: userRole === "USER" ? "N/A" : $('#editDepartment').val() // User nam N/A
    };

    console.log("Updating user profile with data:", JSON.stringify(updatedUser));

    fetch("http://localhost:8080/snapfix/user/update", {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedUser)
    })
    .then(response => {
        if (!response.ok) {
          console.error("Response status:", response.status);
          return response.text().then(text => {
            console.error("Response body:", text);
            throw new Error("Failed to update profile");
          });
        }
        return response.json();
    })
    .then(data => {
        const url = $('#profilePicture').data('url') || $('#avatarImage').data('url') || "";
        addActivity("Updated Profile", "Update", "You updated your personal information.");
        Swal.fire("Success", "Profile updated successfully!", "success");
        $('#profilePicture').data('url', url);
        localStorage.setItem("userImgURL", url);
        fetchUserProfile(updatedUser.userId); // Refresh UI
    })

    .catch(err => {
        console.error("Error updating profile:", err);
        Swal.fire("Error", "Failed to update profile.", "error");
    });
}

function updatePassword() {
    const token = localStorage.getItem("jwtToken");
    const userId = parseInt(localStorage.getItem("userId"));

    const currentPassword = $('#currentPassword').val();
    const newPassword = $('#newPassword').val();
    const confirmPassword = $('#confirmNewPassword').val();

    if (newPassword !== confirmPassword) {
        Swal.fire('Error', 'New password and confirm password do not match.', 'error');
        return;
    }

    const payload = {
        userId,
        currentPassword,
        newPassword,
        confirmPassword
    };

    fetch("http://localhost:8080/snapfix/user/updatePassword", {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) return res.json().then(err => Promise.reject(err));
        return res.json();
    })
    .then(data => {
        addActivity("Changed Password", "Update", "You changed your account password.");
        Swal.fire('Success', 'Password updated successfully!', 'success');
        // Clear password fields
        $('#currentPassword').val('');
        $('#newPassword').val('');
        $('#confirmNewPassword').val('');
    })
    .catch(err => {
        Swal.fire('Error', err.message || 'Failed to update password.', 'error');
    });
}

function showUserDetails() {
    const userName = localStorage.getItem("username") || "Admin User";
    const userRole = localStorage.getItem("role") || "Administrator";
    const userImgURL = localStorage.getItem("userImgURL") || "/Front_End/assets/img/default-user.jpeg";

    // Set avatar with fallback
    $('#avatarImage').attr('src', userImgURL).on('error', function() {
        $(this).attr('src', '/Front_End/assets/img/default-user.jpeg');
    });

    $('#user-name').text(userName);
    $('#user-role').text(userRole);
}

// Utility: Ensure all editable fields are enabled
function enableFormInputs() {
    $('#settings input, #settings textarea').each(function () {
        $(this).prop('disabled', false).prop('readonly', false).css('pointer-events', 'auto');
    });
}
// ===================================================
// ================= Activity Logger =================
// function addActivity(action, type, description) {
//     const now = new Date();
//     const dateString = now.toLocaleString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit"
//     });

//     const timelineItem = `
//         <div class="timeline-item">
//             <div class="timeline-date">${dateString}</div>
//             <div class="timeline-content">
//                 <div class="d-flex justify-content-between">
//                     <strong>${action}</strong>
//                     <span class="badge bg-${getBadgeColor(type)}">${type}</span>
//                 </div>
//                 <p class="mb-0">${description}</p>
//             </div>
//         </div>
//     `;

//     $("#activityTimeline").prepend(timelineItem); // Add to top
// }

// function getBadgeColor(type) {
//     switch(type.toLowerCase()) {
//         case "update": return "success";
//         case "request": return "primary";
//         case "support": return "warning";
//         case "report": return "info";
//         case "new": return "secondary";
//         default: return "dark";
//     }
// }
