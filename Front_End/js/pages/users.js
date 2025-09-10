let selectedUserId = null;

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
    
    const token = localStorage.getItem("jwtToken");

    // ===== Dynamic Departments =====
    const departments = [
        "AC", "Plumbing", "Electrical", "Carpentry", "Painting",
        "Cleaning", "Networking", "Appliance Repair", "HVAC",
        "Masonry", "Roofing", "Pest Control", "ICT", "Hardware"
    ];

    const departmentSelect = $('#userDepartment');
    departmentSelect.empty().append('<option value="" disabled selected>Select department</option>');
    departments.forEach(d => {
        departmentSelect.append(`<option value="${d}">${d}</option>`);
    });

    // ===== Initialize DataTable =====
    let table = $('#usersTable').DataTable({
        columnDefs: [
            { targets: [9, 10, 11, 12], visible: false } // hide street, city, postalCode, userId
        ]
    });

    // ===== Image preview =====
    $('#userImg').on('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#userImgPreview').attr('src', e.target.result).css('display', 'block');
            };
            reader.readAsDataURL(file);
        }
    });

    // ===== Role change handler =====
    $('#userRole').on('change', function () {
        const role = $(this).val();
        const departmentSelect = $('#userDepartment');

        if (role === 'USER') {
            departmentSelect.val('N/A');              // set value to N/A
            departmentSelect.prop('disabled', true); // disable dropdown
        } else {
            departmentSelect.prop('disabled', false); // enable dropdown
            if (departmentSelect.val() === 'N/A') {
                departmentSelect.val(''); // reset to default if previously N/A
            }
        }
    });

    // ===== Row click =====
    $('#usersTable tbody').on('click', 'tr', function () {
        $('#usersTable tbody tr').removeClass('selected');
        $(this).addClass('selected');

        let data = table.row(this).data();
        if (!data) return;

        selectedUserId = data[12]; // hidden userId

        $('#userFullName').val(data[1]);
        $('#userEmail').val(data[2]);
        $('#userMobile').val(data[3]);
        $('#userRole').val(data[4]);
        $('#userDepartment').val(data[5]);
        $('#userName').val(data[6]);
        $('#userStreet').val(data[9]);
        $('#userCity').val(data[10]);
        $('#userPostalCode').val(data[11]);

        // ===== adjust department based on role =====
        $('#userRole').trigger('change');

        $('#btnUpdate').prop('disabled', false);
        $('#btnDelete').prop('disabled', false);
    });

    // ===== Form submit =====
    $('#addUserForm').on('submit', function (e) {
        e.preventDefault();
        addUser(token, table);
    });

    // ===== Update/Delete buttons =====
    $('#btnUpdate').on('click', () => updateUser(token, table, selectedUserId));
    $('#btnDelete').on('click', () => deleteUser(token, table, selectedUserId));

    // ===== Load Users =====
    loadUsers(token, table);

    table.on('draw', function () {
        updateRoleCounts(table);
    });
});

// ===== Add new user =====
async function addUser(token, table) {
    const fileInput = document.getElementById('userImg');
    let imageUrl = "/Front_End/assets/img/default-user.jpeg"; // default fallback

    // Image upload if file selected
    if (fileInput.files[0]) {
        try {
            imageUrl = await uploadImageToImgbb(fileInput.files[0]);
        } catch (err) {
            Swal.fire('Error', 'Image upload failed: ' + err.message, 'error');
            return;
        }
    }

    const formData = {
        userFullName: $('#userFullName').val(),
        userEmail: $('#userEmail').val(),
        userMobile: $('#userMobile').val(),
        userRole: $('#userRole').val(),
        street: $('#userStreet').val(),
        city: $('#userCity').val(),
        postalCode: $('#userPostalCode').val(),
        userDepartment: $('#userDepartment').val(),
        userName: $('#userName').val(),
        userPassword: $('#userPassword').val(),
        userImgURL: imageUrl   // <--- image ekath DB ekata yawanwa
    };

    try {
        const res = await fetch('http://localhost:8080/snapfix/user/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to add user');
        addActivity("Added User", "Create", `You added a new user: ${formData.userFullName} (${formData.userRole}).`);
        Swal.fire('Success', 'User Added!', 'success');
        clearForm();
        loadUsers(token, table);
    } catch (err) {
        Swal.fire('Error!', err.message, 'error');
    }
}

// // ===== Update user =====
// async function updateUser(token, table) {
//     if (!selectedUserId) {
//         Swal.fire('Error', 'Please select a user first', 'warning');
//         return;
//     }

//     const formData = {
//         userId: selectedUserId,
//         userFullName: $('#userFullName').val(),
//         userEmail: $('#userEmail').val(),
//         userMobile: $('#userMobile').val(),
//         userRole: $('#userRole').val(),
//         street: $('#userStreet').val(),
//         city: $('#userCity').val(),
//         postalCode: $('#userPostalCode').val(),
//         userDepartment: $('#userDepartment').val(),
//         userName: $('#userName').val()
//     };

//     try {
//         const res = await fetch('http://localhost:8080/snapfix/user/update', {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             body: JSON.stringify(formData)
//         });

//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || 'Failed to update user');

//         Swal.fire('Success', 'User Updated!', 'success');
//         clearForm();
//         loadUsers(token, table);
//         selectedUserId = null;
//     } catch (err) {
//         Swal.fire('Error!', err.message, 'error');
//     }
// }

// // ===== Delete user =====
// async function deleteUser(token, table) {
//     if (!selectedUserId) {
//         Swal.fire('Error', 'Please select a user first', 'warning');
//         return;
//     }

//     Swal.fire({
//         title: 'Are you sure?',
//         text: "You won't be able to revert this!",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonText: 'Yes, delete it!'
//     }).then(async (result) => {
//         if (result.isConfirmed) {
//             try {
//                 const res = await fetch(`http://localhost:8080/snapfix/user/delete/${selectedUserId}`, {
//                     method: 'DELETE',
//                     headers: { 'Authorization': `Bearer ${token}` }
//                 });

//                 if (!res.ok) {
//                     const data = await res.json();
//                     throw new Error(data.message || 'Failed to delete user');
//                 }

//                 Swal.fire('Deleted!', 'User has been deleted.', 'success');
//                 clearForm();
//                 loadUsers(token, table);
//                 selectedUserId = null;
//             } catch (err) {
//                 Swal.fire('Error!', err.message, 'error');
//             }
//         }
//     });
// }

// ===== Update user =====
async function uploadImageToImgbb(file) {
    const YOUR_IMGBB_API_KEY = "ba48954b39f744891fd598cf3b058597"
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${YOUR_IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error('Image upload failed');
    return data.data.url; // This is the URL you store in DB
}

async function updateUser(token, table, userId) {
    if (!userId) {
        Swal.fire('Error', 'Please select a user first', 'warning');
        return;
    }

    const fileInput = document.getElementById('userImg');

    // Upload image to ImgBB if a file is selected
    let imageUrl = null;
    if (fileInput.files[0]) {
        try {
            imageUrl = await uploadImageToImgbb(fileInput.files[0]);
        } catch (err) {
            Swal.fire('Error', 'Image upload failed: ' + err.message, 'error');
            return;
        }
    }

    const userObj = {
        userId: userId,
        userFullName: $('#userFullName').val(),
        userEmail: $('#userEmail').val(),
        userMobile: $('#userMobile').val(),
        userRole: $('#userRole').val(),
        street: $('#userStreet').val(),
        city: $('#userCity').val(),
        postalCode: $('#userPostalCode').val(),
        userDepartment: $('#userDepartment').val(),
        userName: $('#userName').val(),
        userImgURL: imageUrl // Correct field name
    };


    try {
        const res = await fetch('http://localhost:8080/snapfix/user/updateAllFormData', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userObj)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update user');
        addActivity("Updated User", "Update", `You updated user: ${userObj.userFullName} (${userObj.userRole}).`);
        Swal.fire('Success', 'User Updated!', 'success');
        clearForm();
        loadUsers(token, table);
        selectedUserId = null;
    } catch (err) {
        Swal.fire('Error!', err.message, 'error');
    }
}

// ===== Delete user =====
async function deleteUser(token, table) { 
    console.log("Delete function called"); // debug

    if (!selectedUserId) {
        console.log("No user selected for delete"); // debug
        Swal.fire('Error', 'Please select a user first', 'warning');
        return;
    }

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            console.log("Confirmed delete for userId:", selectedUserId); // debug
            try {
                const res = await fetch(`http://localhost:8080/snapfix/user/delete/${selectedUserId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                console.log("Delete response status:", res.status); // debug

                if (!res.ok) {
                    const data = await res.json();
                    console.log("Delete response error data:", data); // debug
                    throw new Error(data.message || 'Failed to delete user');
                }
                addActivity("Deleted User", "Delete", `You deleted a user with ID: ${selectedUserId}.`);
                Swal.fire('Deleted!', 'User has been deleted.', 'success');
                clearForm();
                loadUsers(token, table);
                selectedUserId = null;
            } catch (err) {
                console.error("Delete error:", err); // debug
                Swal.fire('Error!', err.message, 'error');
            }
        }
    });
}


// ===== Load all users =====
async function loadUsers(token, table) {
    try {
        const res = await fetch('http://localhost:8080/snapfix/user/getall', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load users');

        populateUsersTable(data.data, table, token);
    } catch (err) {
        Swal.fire('Error!', err.message, 'error');
    }
}

// Populate users table//
function populateUsersTable(users, table, token) {
    table.clear();

    const currentUserId = parseInt(localStorage.getItem("userId"));

    users.forEach((user, index) => {
        const userImage = user.userImgURL && user.userImgURL !== "" ?
            `<img src="${user.userImgURL}" alt="User Image" class="table-user-img" />` :
            `<img src="/Front_End/assets/img/default-user.jpeg" alt="Default Image" class="table-user-img" />`; 

        const statusBadge = user.status
            ? '<span class="badge bg-success me-1">Active</span>'
            : '<span class="badge bg-danger me-1">Inactive</span>';

        const availabilityBadge = user.availability
            ? '<span class="badge bg-success">Available</span>'
            : '<span class="badge bg-danger">Not Available</span>';

        const isCurrentUser = user.userId === currentUserId;

        const statusBtnClass = user.status ? 'btn-danger' : 'btn-success';
        const availabilityBtnClass = user.availability ? 'btn-warning' : 'btn-primary';

        // Disable status button for current user
        const statusDisabled = isCurrentUser ? 'disabled' : '';

        // Disable availability button if user is inactive OR current user
        const availabilityDisabled = (!user.status || isCurrentUser) ? 'disabled' : '';

        // Only show availability button for non-admin users
        const showAvailabilityBtn = (user.userRole !== 'USER');

        const actionButtons = `
            <div class="d-flex gap-2">
                <!-- Status toggle -->
                <button class="btn btn-sm ${statusBtnClass}" 
                    onclick="toggleUserStatus(${user.userId}, ${!user.status}, '${token}')"
                    title="${user.status ? 'Deactivate User' : 'Activate User'}" ${statusDisabled}>
                    <i class="fas ${user.status ? 'fa-user-slash' : 'fa-user-check'}"></i>
                </button>

                <!-- Availability toggle (only for non-admins) -->
                ${showAvailabilityBtn ? `
                <button class="btn btn-sm ${availabilityBtnClass}" 
                    onclick="toggleUserAvailability(${user.userId}, ${!user.availability}, '${token}')"
                    title="${user.availability ? 'Set Not Available' : 'Set Available'}" ${availabilityDisabled}>
                    <i class="fas fa-clock"></i>
                </button>
                ` : ''}
            </div>
        `;

        table.row.add([
            index + 1 + userImage,
            user.userFullName,
            user.userEmail,
            user.userMobile,
            user.userRole,
            user.userDepartment || 'N/A',
            user.userName,
            `${statusBadge} ${availabilityBadge}`,
            actionButtons,
            user.street || '',
            user.city || '',
            user.postalCode || '',
            user.userId
        ]);
    });

    table.draw();
}

// ===== Toggle user status =====
async function toggleUserStatus(userId, newStatus, token) {
    const endpoint = newStatus ? 'activate' : 'deactivate';
    try {
        const res = await fetch(`http://localhost:8080/snapfix/user/${endpoint}/${userId}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Failed to ${newStatus ? 'activate' : 'deactivate'} user`);
        addActivity("Toggled User Status", "Update", `You ${newStatus ? 'activated' : 'deactivated'} a user with ID: ${userId}.`);
        Swal.fire('Success!', `User ${newStatus ? 'activated' : 'deactivated'}`, 'success');
        let table = $('#usersTable').DataTable();
        loadUsers(token, table);
    } catch (err) {
        Swal.fire('Error!', err.message, 'error');
    }
}

// ===== Toggle user availability =====
async function toggleUserAvailability(userId, newAvailability, token) {
    const endpoint = newAvailability ? 'activateAvailability' : 'deactivateAvailability';
    try {
        const res = await fetch(`http://localhost:8080/snapfix/user/${endpoint}/${userId}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Failed to ${newAvailability ? 'activate' : 'deactivate'} availability`);
        addActivity("Toggled User Availability", "Update", `You set ${newAvailability ? 'available' : 'not available'} a user with ID: ${userId}.`);
        Swal.fire('Success!', `User is now ${newAvailability ? 'Available' : 'Not Available'}`, 'success');
        let table = $('#usersTable').DataTable();
        loadUsers(token, table);
    } catch (err) {
        Swal.fire('Error!', err.message, 'error');
    }
}


// ===== Clear form =====
function clearForm() {
   // Clear all input fields
    $('#addUserForm')[0].reset();

    // Hide image preview
    $('#userImgPreview').attr('src', '').css('display', 'none');
    // Reset department dropdown
     $('#userDepartment').prop('disabled', false);

    // Disable buttons
    $('#btnUpdate').prop('disabled', true);
    $('#btnDelete').prop('disabled', true);

    // Clear selected user ID
    selectedUserId = null;

    // Remove selected row highlight from table
    $('#usersTable tbody tr').removeClass('selected');
}

function updateRoleCounts(table) {
    let totalCount = 0, adminCount = 0, techCount = 0, userCount = 0;

    table.rows().every(function () {
        const rowData = this.data();
        const role = rowData[4]?.toUpperCase(); // Role is column index 4

        if (role === "ADMIN") adminCount++;
        else if (role === "TECHNICIAN") techCount++;
        else if (role === "USER") userCount++;
        totalCount++;
    });

    $("#totalCount").text(totalCount);
    $("#adminCount").text(adminCount);
    $("#techCount").text(techCount);
    $("#userCount").text(userCount);
}
