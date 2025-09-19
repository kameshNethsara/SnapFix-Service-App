$(document).ready(function () {
    const API_BASE = "http://localhost:8080";
    const SR_ENDPOINT = "/snapfix/service-requests";
    const PAY_ENDPOINT = "/snapfix/payments";
    const USERS_ENDPOINT = "/snapfix/user/getall";

    const jwtToken = localStorage.getItem("jwtToken") || "";
    let usersData = [];
    let paymentsData = [];

    // ===== FETCH USERS =====
    async function fetchUsers() {
        try {
            const res = await fetch(API_BASE + USERS_ENDPOINT, {
                headers: { "Authorization": "Bearer " + jwtToken }
            });
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            usersData = Array.isArray(data.data) ? data.data : [];
        } catch (err) {
            console.error("Error fetching users:", err);
            usersData = [];
        }
    }

    // ===== FETCH ALL PAYMENTS =====
    async function fetchAllPayments() {
        try {
            const res = await fetch(API_BASE + PAY_ENDPOINT + "/getAll", {
                headers: { "Authorization": "Bearer " + jwtToken }
            });
            if (!res.ok) throw new Error("Failed to fetch payments");
            paymentsData = await res.json();
            populatePaymentsTable(paymentsData);
        } catch (err) {
            console.error("Error fetching payments:", err);
            paymentsData = [];
        }
    }

    // ===== POPULATE PAYMENTS TABLE =====
    async function populatePaymentsTable(payments) {
        const tableBody = $("#paymentsTable tbody");
        tableBody.empty();

        // fetch all service requests once (you can optimize by caching)
        let services = [];
        try {
            const res = await fetch(API_BASE + SR_ENDPOINT + "/getAllRequests", {
                headers: { "Authorization": "Bearer " + jwtToken }
            });
            if (res.ok) services = await res.json();
        } catch (err) {
            console.error("Error fetching services for table:", err);
        }

        payments.forEach(p => {
        // find related service request
            const service = services.find(s => (s.id || s.requestId) == p.serviceRequestId);

            const techName = service ? (service.technicianName || "Unknown Technician") : "Unknown Technician";
            const user = service ? usersData.find(u => u.userId == service.userId) : null;
            const userName = user ? (user.userFullName || user.userName) : "Unknown User";

            const billImg = p.billImageUrl ? `<img src="${p.billImageUrl}" style="max-height:50px;" />` : "-";

             // status badge
            let statusBadge = "";
                if (p.status === "PAID") {
                    statusBadge = `<span class="badge bg-success">Paid</span>`;
                } else if (p.status === "PENDING") {
                    statusBadge = `<span class="badge bg-warning text-dark">Pending</span>`;
                } else {
                    statusBadge = `<span class="badge bg-secondary">${p.status}</span>`; // fallback
                }
            
            const row = `
                <tr>
                    <td>${p.serviceRequestId}</td>
                    <td>${userName}</td>
                    <td>${techName}</td>
                    <td>${p.amount}</td>
                    <td>${p.description}</td>
                    <td>${billImg}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
            tableBody.append(row);
        });
    }

    // ===== FETCH COMPLETED SERVICES WITHOUT PAYMENTS =====
    async function fetchCompletedServices() {
        try {
            const res = await fetch(API_BASE + SR_ENDPOINT + "/getAllRequests", {
                headers: { "Authorization": "Bearer " + jwtToken }
            });
            if (!res.ok) throw new Error("Failed to fetch services");

            const data = await res.json();
            const completed = (Array.isArray(data) ? data : []).filter(
                s => (s.status || s.requestStatus || "").toUpperCase() === "COMPLETED"
            );

            // Exclude services that already have a payment
            const unpaidServices = completed.filter(
                s => !paymentsData.find(p => p.serviceRequestId == (s.id || s.requestId))
            );

            populatePaymentCards(unpaidServices);
        } catch (err) {
            console.error("Error fetching completed services:", err);
        }
    }

    // ===== POPULATE PAYMENT CARDS =====
    function populatePaymentCards(data) {
        const container = $("#paymentContainer");
        container.empty();

        data.forEach(service => {
            const reqId = service.id || service.requestId;
            const techName = service.technicianName || "Unknown Technician";
            const user = usersData.find(u => u.userId == service.userId);
            const userName = user ? (user.userFullName || user.userName || "No Name") : "Unknown User";
            const serviceTitle = service.title || "No Title";
            const serviceDesc = service.description || "No Description";

            const card = `
                <div class="card mb-4 shadow-sm rounded-3">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Service Request #${reqId}</h5>
                    </div>
                    <div class="card-body">
                        <div class="row mb-2">
                            <div class="col-md-6"><strong>User:</strong> ${userName}</div>
                            <div class="col-md-6"><strong>Technician:</strong> ${techName}</div>
                        </div>
                        <div class="mb-2"><strong>Title:</strong> ${serviceTitle}</div>
                        <div class="mb-3"><strong>Description:</strong> ${serviceDesc}</div>
                        <input type="hidden" class="req-id" value="${reqId}" />

                        <div class="mb-3">
                            <label class="form-label">Amount</label>
                            <input type="number" class="form-control amount-input" placeholder="Enter amount" />
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Payment Description</label>
                            <textarea class="form-control desc-input" rows="2" placeholder="Optional description"></textarea>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Upload Bill</label>
                            <input type="file" class="form-control bill-upload" accept="image/*" />
                            <div class="preview mt-2"></div>
                        </div>

                        <div class="text-center my-3 spinner-border text-primary d-none card-spinner" role="status">
                            <span class="visually-hidden">Saving...</span>
                        </div>

                        <div class="d-flex justify-content-center">
                            <button class="btn btn-primary save-payment ">Save Payment</button>
                        </div>
                    </div>
                </div>
                `;
            container.append(card);
        });
    }

    // ===== IMAGE UPLOAD =====
    async function uploadImageToImgbb(file) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=ba48954b39f744891fd598cf3b058597`, {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error("Image upload failed");
        return data.data.url;
    }

    // ===== SAVE PAYMENT =====
    $(document).on("click", ".save-payment", async function () {
        const card = $(this).closest(".card-body");
        const spinner = card.find(".card-spinner");
        const reqId = card.find(".req-id").val();
        const amount = card.find(".amount-input").val();
        const desc = card.find(".desc-input").val();
        const fileInput = card.find(".bill-upload")[0];
        let imgUrl = "";

        if (!amount) { Swal.fire("Error", "Amount is required", "error"); return; }
        spinner.removeClass("d-none");

        try {
            if (fileInput.files.length > 0) imgUrl = await uploadImageToImgbb(fileInput.files[0]);

            const payload = {
                serviceRequestId: reqId,
                amount: amount,
                description: desc,
                billImageUrl: imgUrl,
                method: "Haven't a payment yet"

            };
            const res = await fetch(API_BASE + PAY_ENDPOINT + "/create", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": "Bearer " + jwtToken },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Failed to save payment");

            Swal.fire("Success", "Payment saved successfully", "success");

            // Update paymentsData immediately with the new payment
            const newPayment = await res.json();
            paymentsData.push(newPayment);

            // Remove the card
            card.closest(".card").remove();

            // Refresh table and cards
            populatePaymentsTable(paymentsData);   // use updated paymentsData
            fetchCompletedServices();              // filter unpaid services using updated paymentsData
        } catch (err) {
            Swal.fire("Error", err.message || err, "error");
        } finally {
            spinner.addClass("d-none");
        }
    });

    // ===== IMAGE PREVIEW =====
    $(document).on("change", ".bill-upload", function () {
        const file = this.files[0];
        const previewDiv = $(this).siblings(".preview");
        if (file) {
            const reader = new FileReader();
            reader.onload = e => previewDiv.html(`<img src="${e.target.result}" class="img-fluid" style="max-height:150px;" />`);
            reader.readAsDataURL(file);
        } else { previewDiv.empty(); }
    });

    // ===== INITIAL LOAD =====
    (async function init() {
        await fetchUsers();
        await fetchAllPayments();
        await fetchCompletedServices();
    })();
});
