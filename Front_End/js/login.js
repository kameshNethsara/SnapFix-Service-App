$(document).ready(function () {

  // Toggle Sign-In / Sign-Up
  const container = $('#container');
  window.toggle = function () {
    container.toggleClass('sign-in sign-up');
  };
  container.addClass('sign-in');

  // Show/Hide password
  $('.toggle-password').on('click', function () {
    const input = $(this).prev('.password-field');
    const type = input.attr('type') === 'password' ? 'text' : 'password';
    input.attr('type', type);
    $(this).toggleClass('bx-show bx-hide');
  });

  // ==== SIGN UP ====
  $(".sign-up button").click(async function (e) {
      e.preventDefault();

      const username = $("#sign-up-username").val().trim();
      const email = $("#sign-up-email").val().trim();
      const password = $("#sign-up-password").val();
      const confirmPassword = $("#sign-up-confirm").val();
      const role = $("#sign-up-role").val();

      if (!username || !email || !password || !confirmPassword || !role) {
          Swal.fire("Oops!", "Please fill all the fields!", "warning");
          return;
      }

      if (password !== confirmPassword) {
          Swal.fire("Oops!", "Passwords do not match!", "error");
          return;
      }

      const registerData = {
          userName: username,
          userEmail: email,
          userPassword: password,
          userRole: role.toUpperCase()
      };

      try {
          const response = await fetch("http://localhost:8080/snapfixauth/register", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify(registerData)
          });

          if (!response.ok) {
              const err = await response.json();
              throw new Error(err.message || "Registration failed");
          }

          Swal.fire("Success!", "Account created successfully!", "success").then(() => {
              toggle(); // switch to login form
          });

      } catch (error) {
          Swal.fire("Error", error.message || "Registration failed!", "error");
      }
  });

  // ==== SIGN IN ====
  $(".sign-in button").click(async function (e) {
      e.preventDefault();

      const userLoginData = {
          email: $("#sign-in-email").val().trim(),
          password: $("#sign-in-password").val().trim()
      };

      if (!userLoginData.email || !userLoginData.password) {
          Swal.fire("Oops!", "Please enter email and password!", "warning");
          return;
      }

    //   console.log("Login Data:", userLoginData);

      try {
          const response = await fetch('http://localhost:8080/snapfixauth/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(userLoginData)
          });

          if (!response.ok) {
              const err = await response.json();
              throw new Error(err.message || "Login failed");
          }

          const results = await response.json();
          const token = results.data.accessToken;
          const username = results.data.username;
          const role = results.data.role;
          const fullName = results.data.fullName;
          const email = results.data.email;
          const mobile = results.data.mobile;
          const location = results.data.location;
          const department = results.data.department;
          const userWhenCreated = results.data.userWhenCreated;
          const userInfo = results.data.userInfo;

          const profileImage = results.data.userImgURL;

          // Store in localStorage if needed
          localStorage.setItem("jwtToken", token);
          localStorage.setItem("username", username);
          localStorage.setItem("role", role);
          localStorage.setItem("userId", results.data.userId);
          localStorage.setItem("fullName", fullName);
          localStorage.setItem("email", email);
          localStorage.setItem("mobile", mobile);
          localStorage.setItem("location", location);
          localStorage.setItem("department", department);
          localStorage.setItem("userWhenCreated", userWhenCreated);
          localStorage.setItem("userInfo", userInfo);
          localStorage.setItem("profileImage", profileImage);

          Swal.fire("Login Successful!", "Welcome " + username + "!", "success").then(() => {
              window.location.href = "/Front_End/html/pages/dashboard.html";
          });

      } catch (error) {
          Swal.fire("Login Failed!", error.message || "Invalid credentials", "error");
      }
  });
    
});