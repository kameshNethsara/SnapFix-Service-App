$(document).ready(function () {
    const userId = 1; // Replace with dynamic user ID if available

    // Load profile data on page load
    fetchUserProfile(userId);

    // Handle avatar file input change
    $('#avatarUpload').on('change', function () {
        const file = this.files[0];
        if (!file) return;

        // Preview image
        const reader = new FileReader();
        reader.onload = function (e) {
            $('#avatarImage').attr('src', e.target.result);
        };
        reader.readAsDataURL(file);

        // Upload to ImgBB
        uploadToImgBB(file)
            .then((url) => {
                $('#avatarImage').attr('src', url);
                $('#avatarImage').data('url', url); // Save in data attribute
            })
            .catch((err) => {
                console.error('Image upload failed:', err);
                Swal.fire('Upload Failed', 'Failed to upload avatar. Try again.', 'error');
            });
    });

    // Handle profile update
    $('.btn.btn-primary.w-100').on('click', function () {
        const updatedUser = {
            userId: userId,
            userFullName: $('input[type="text"]').eq(0).val(),
            userEmail: $('input[type="email"]').val(),
            userMobile: $('input[type="tel"]').val(),
            userDepartment: $('input[type="text"]').eq(1).val(),
            userImgURL: $('#avatarImage').data('url') || $('#avatarImage').attr('src'),
        };

        $.ajax({
            url: 'http://localhost:8080/snapfix/user/update',
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updatedUser),
            success: function (res) {
                Swal.fire('Success', 'Profile updated successfully!', 'success');
                fetchUserProfile(userId); // reload profile
            },
            error: function (err) {
                console.error(err);
                Swal.fire('Error', 'Failed to update profile.', 'error');
            }
        });
    });

    // Fetch and display user data
    function fetchUserProfile(userId) {
        $.get(`http://localhost:8080/snapfix/user/get/${userId}`, function (res) {
            const user = res.data;

            // Profile tab
            $('.user-name').text(user.userFullName || 'N/A');
            $('.user-role').text(user.userRole || 'N/A');
            $('#avatarImage').attr('src', user.userImgURL || 'https://via.placeholder.com/120').data('url', user.userImgURL);

            // Settings form
            $('input[type="text"]').eq(0).val(user.userFullName);
            $('input[type="email"]').val(user.userEmail);
            $('input[type="tel"]').val(user.userMobile);
            $('input[type="text"]').eq(1).val(user.userDepartment);
        });
    }

    // Upload image to ImgBB
    function uploadToImgBB(file) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("image", file);

            $.ajax({
                url: 'https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY', // Replace with your actual API key
                method: 'POST',
                processData: false,
                contentType: false,
                data: formData,
                success: function (response) {
                    resolve(response.data.url);
                },
                error: function (err) {
                    reject(err);
                }
            });
        });
    }
});
