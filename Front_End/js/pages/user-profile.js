$(document).ready(function () {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        Swal.fire("Error", "User ID not found. Please login again.", "error");
        return window.location.href = "/Front_End/html/login.html";
    }

    // Load profile data
    fetchUserProfile(userId);
    showUserDetails();

    // Allow typing in input fields (force remove readonly/disabled if needed)
    enableFormInputs();

    // Avatar upload preview
    $('#avatarUpload').on('change', function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            $('#avatarImage').attr('src', e.target.result);
        };
        reader.readAsDataURL(file);

        uploadToImgBB(file)
            .then((url) => {
                $('#avatarImage').attr('src', url).data('url', url);
                $('#profilePicture').data('url', url); // store it for update
                Swal.fire('Uploaded!', 'Avatar updated successfully.', 'success');
            })
            .catch((err) => {
                console.error('Image upload failed:', err);
                Swal.fire('Upload Failed', 'Failed to upload avatar.', 'error');
            });
    });

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
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("image", file);

        fetch("https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY", {
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

    const updatedUser = {
        userId: parseInt(localStorage.getItem("userId")),
        userName: username,
        userRole: role,
        userWhenCreated: userWhenCreated,
        userImgURL: $('#profilePicture').data('url') || "",
        userFullName: $('#editFullName').val(),
        userEmail: $('#editEmail').val(),
        userMobile: $('#editMobile').val(),
        userInfo: $('#editUserInfo').val(),
        street: $('#editStreet').val(),
        city: $('#editCity').val(),
        postalCode: $('#editPostalCode').val(),
        userDepartment: $('#editDepartment').val()
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
        Swal.fire("Success", "Profile updated successfully!", "success");
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

    $('#user-name').text(userName);
    $('#user-role').text(userRole);
}

// Utility: Ensure all editable fields are enabled
function enableFormInputs() {
    $('#settings input, #settings textarea').each(function () {
        $(this).prop('disabled', false).prop('readonly', false).css('pointer-events', 'auto');
    });
}
