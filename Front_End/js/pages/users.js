let selectedUserId = null;
$(document).ready(function () {
    const token = localStorage.getItem("jwtToken");

    // Initialize DataTable only once and hide columns
    let table = $('#usersTable').DataTable({
        columnDefs: [
            { targets: [9, 10, 11, 12], visible: false } // hide street, city, postalCode, userId
        ]
    });

    // Image preview handler
    $('#userImg').on('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#userImgPreview')
                    .attr('src', e.target.result)
                    .css('display', 'block');
            };
            reader.readAsDataURL(file);
        }
    });

    // Row click handler
    $('#usersTable tbody').on('click', 'tr', function () {
        let data = table.row(this).data();
        if (!data) return;

        selectedUserId = data[12]; // hidden userId column

        $('#userFullName').val(data[1]);
        $('#userEmail').val(data[2]);
        $('#userMobile').val(data[3]);
        $('#userRole').val(data[4]);
        $('#userDepartment').val(data[5]);
        $('#userName').val(data[6]);
        $('#userStreet').val(data[9]);     
        $('#userCity').val(data[10]);         
        $('#userPostalCode').val(data[11]); 

        $('#btnUpdate').prop('disabled', false);
        $('#btnDelete').prop('disabled', false);
    });

    // Form submission handler
    $('#addUserForm').on('submit', function (e) {
        e.preventDefault();
        addUser(token, table);
    });

    // Update and Delete buttons
    $('#btnUpdate').on('click', () => updateUser(token, table, selectedUserId));
    $('#btnDelete').on('click', () => deleteUser(token, table, selectedUserId));

    // Load initial user data
    loadUsers(token, table);
    
    // after fetching users or on table draw
    table.on('draw', function () {
        updateRoleCounts(table);
    });

});

// ===== Add new user =====
async function addUser(token, table) {
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
        userPassword: $('#userPassword').val()
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
async function updateUser(token, table,userId) { 
    console.log("Update function called"); // debug

    if (!userId) {
        console.log("No user selected for update"); // debug
        Swal.fire('Error', 'Please select a user first', 'warning');
        return;
    }

    const formData = {
        userId: userId,
        userFullName: $('#userFullName').val(),
        userEmail: $('#userEmail').val(),
        userMobile: $('#userMobile').val(),
        userRole: $('#userRole').val(),
        street: $('#userStreet').val(),
        city: $('#userCity').val(),
        postalCode: $('#userPostalCode').val(),
        userDepartment: $('#userDepartment').val(),
        userName: $('#userName').val()
    };

    console.log("Form data for update:", formData); // debug

    try {
        const res = await fetch('http://localhost:8080/snapfix/user/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        console.log("Response status:", res.status); // debug
        const data = await res.json();
        console.log("Response data:", data); // debug

        if (!res.ok) throw new Error(data.message || 'Failed to update user');

        Swal.fire('Success', 'User Updated!', 'success');
        clearForm();
        loadUsers(token, table);
        selectedUserId = null;
    } catch (err) {
        console.error("Update error:", err); // debug
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

// ===== Populate users table =====
function populateUsersTable(users, table, token) {
    table.clear();

    users.forEach((user, index) => {
        const statusBadge = user.status ?
            '<span class="badge bg-success">Active</span>' :
            '<span class="badge bg-danger">Inactive</span>';

        table.row.add([
            index + 1,
            user.userFullName,
            user.userEmail,
            user.userMobile,
            user.userRole,
            user.userDepartment || 'N/A',
            user.userName,
            statusBadge,
            `<button class="btn btn-sm ${user.status ? 'btn-warning' : 'btn-success'}" 
                onclick="toggleUserStatus(${user.userId}, ${!user.status}, '${token}')">
                <i class="fas ${user.status ? 'fa-toggle-off' : 'fa-toggle-on'} icon"></i>
            </button>`,
            user.street || '',
            user.city || '',
            user.postalCode || '',
            user.userId // hidden column
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

        Swal.fire('Success!', `User ${newStatus ? 'activated' : 'deactivated'}`, 'success');
        let table = $('#usersTable').DataTable();
        loadUsers(token, table);
    } catch (err) {
        Swal.fire('Error!', err.message, 'error');
    }
}

// ===== Clear form =====
function clearForm() {
    $('#addUserForm')[0].reset();
    $('#userImgPreview').attr('src', '').css('display', 'none');
    $('#btnUpdate').prop('disabled', true);
    $('#btnDelete').prop('disabled', true);
    selectedUserId = null;
}

function updateRoleCounts(table) {
    let adminCount = 0, techCount = 0, userCount = 0;

    table.rows().every(function () {
        const rowData = this.data();
        const role = rowData[4]?.toUpperCase(); // Role is column index 4

        if (role === "ADMIN") adminCount++;
        else if (role === "TECHNICIAN") techCount++;
        else if (role === "USER") userCount++;
    });

    $("#adminCount").text(adminCount);
    $("#techCount").text(techCount);
    $("#userCount").text(userCount);
}
