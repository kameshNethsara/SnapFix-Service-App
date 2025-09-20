$(document).ready(function () {
    const API_BASE = "http://localhost:8080";
    const PAY_ENDPOINT = "/snapfix/payments/user-payments";
    const token = localStorage.getItem("jwtToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
        Swal.fire("Error", "User not logged in!", "error");
        return;
    }

    const $paymentCards = $("#paymentCards");
    const $paymentsTable = $("#paymentsTable").DataTable({
        columns: [
            { data: "requestId", visible: false },
            { data: "paymentId", visible: false },
            { data: null, render: (d, t, r, meta) => meta.row + 1 },
            { data: "userName" },
            { data: "technicianName" },
            { data: "amount", render: data => `LKR ${data ?? 0}` },
            { data: "method" },
            { data: "status" },
            { data: "paymentDate" }
        ]
    });

    function showSpinner(show = true) {
        $("#loadingSpinner").toggleClass("d-none", !show);
    }

    async function fetchUserPayments() {
        showSpinner(true);
        try {
            const res = await fetch(`${API_BASE}${PAY_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch payments");

            let payments = await res.json();
            payments = payments.filter(p => String(p.userId) === String(userId));

            renderCards(payments);
            renderTable(payments);

        } catch (err) {
            console.error("fetchUserPayments error:", err);
            Swal.fire("Error", err.message, "error");
        } finally {
            showSpinner(false);
        }
    }

    function normalizePayment(p) {
        return {
            requestId: p.requestId ?? p.serviceRequestId,
            paymentId: p.paymentId ?? p.id,
            userName: p.userName ?? "Unknown",
            technicianName: p.technicianName ?? "Not assigned",
            amount: p.amount ?? 0,
            method: p.method ?? "N/A",
            status: p.status ?? "PENDING",
            paymentDate: p.paymentDate ?? "",
            title: p.title ?? "",
            description: p.description ?? "",
            paydesc: p.paydesc ?? "",
            billImageUrl: p.billImageUrl ?? ""
        };
    }

    function renderCards(payments) {
        $paymentCards.empty();

        if (!payments.length) {
            $paymentCards.append(`<div class="col-12 text-center py-5"><p class="text-muted">No payments found.</p></div>`);
            return;
        }

         //  Sort payments so that PENDING appear first
        const sortedPayments = payments
            .map(normalizePayment)
            .sort((a, b) => {
                if (a.status === "PENDING" && b.status !== "PENDING") return -1;
                if (a.status !== "PENDING" && b.status === "PENDING") return 1;
                return 0; // keep original order for same status
            });

        sortedPayments.forEach(p => {
            const isPaid = p.status === "PAID";
            const statusClass = isPaid ? "status-paid" : "status-pending";
            const statusText = isPaid ? "Paid" : "Pending";

            const card = $(`
                <div class="col-md-6 col-lg-6 mb-4">
                    <div class="card payment-card h-100 d-flex flex-column">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5>Request #${p.requestId}</h5>
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>

                        <div class="card-body d-flex flex-column flex-grow-1">
                            <div class="scroll-content flex-grow-1">
                                <div class="info-row"><span class="info-label">User:</span><span class="info-value">${p.userName}</span></div>
                                <div class="info-row"><span class="info-label">Technician:</span><span class="info-value">${p.technicianName}</span></div>
                                <div class="info-row"><span class="info-label">Title:</span><span class="info-value">${p.title}</span></div>
                                <div class="mb-3 mt-2">
                                    <label class="form-label fw-semibold">Description</label>
                                    <textarea class="form-control" readonly style="resize: none; max-height: 100px; overflow-y: auto; text-align: left;">${p.description}</textarea>
                                </div>
                            </div>

                            <div class="amount-display my-2">
                                <div class="amount-label">Amount to Pay</div>
                                <div class="amount-value">LKR ${p.amount}</div>
                            </div>

                            <div class="mb-3 mt-2">
                                <label class="form-label fw-semibold">Payment Description</label>
                                <textarea class="form-control" readonly style="resize: none; max-height: 100px; overflow-y: auto; text-align: left;">${p.paydesc}</textarea>
                            </div>

                            ${p.billImageUrl ? `<div class="bill-image my-2"><img src="${p.billImageUrl}" alt="Bill Image" class="img-fluid"/></div>` : ""}

                            <div class="mb-3 mt-2">
                                <label class="form-label fw-semibold">Payment Method</label>
                                <select class="form-select payment-method">
                                    <option value="CASH" ${p.method === "CASH" ? "selected" : ""}>CASH</option>
                                    <option value="CARD" ${p.method === "CARD" ? "selected" : ""}>CARD</option>
                                    <option value="ONLINE" ${p.method === "ONLINE" ? "selected" : ""}>ONLINE</option>
                                </select>
                            </div>

                            <div class="text-center my-3 spinner-border text-primary d-none card-spinner" role="status">
                                <span class="visually-hidden">Saving...</span>
                            </div>
                        </div>

                        <div class="card-footer">
                            <button class="btn btn-pay save-method" data-id="${p.requestId}" ${isPaid ? 'disabled' : ''}>
                                ${isPaid ? 'Payment Completed' : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                </div>
            `);

            $paymentCards.append(card);
        });

        $(".save-method").off("click").on("click", async function () {
            const requestId = $(this).data("id");
            const $card = $(this).closest(".card");
            const newMethod = $card.find(".payment-method").val();
            const $spinner = $card.find(".card-spinner");

            if (!newMethod) {
                Swal.fire("Error", "Payment method is empty!", "error");
                return;
            }

            const { isConfirmed } = await Swal.fire({
                title: "Confirm Payment",
                html: `You are about to pay using <b>${newMethod}</b>. Proceed?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes, Pay Now",
                cancelButtonText: "Cancel"
            });

            if (!isConfirmed) return;

            try {
                $spinner.removeClass("d-none");
                // Inside $(".save-method").off("click").on("click", async function () { ... })
                if (newMethod === "CARD" || newMethod === "ONLINE") {
                    const amountValue = parseFloat($card.find(".amount-value").text().replace('LKR ', ''));
                    
                    const stripeRes = await fetch(`${API_BASE}/snapfix/payments/service/${requestId}/stripe`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            amount: amountValue, 
                            method: newMethod, 
                            currency: "lkr"
                        })
                    });

                    if (!stripeRes.ok) {
                        const errorText = await stripeRes.text();
                        throw new Error(`Stripe session failed: ${errorText}`);
                    }

                    const stripeData = await stripeRes.json();

                    // Show modal
                    $("#payment-amount").text(`LKR ${amountValue.toFixed(2)}`);
                    const securePaymentModal = new bootstrap.Modal(document.getElementById("securePaymentModal"));
                    securePaymentModal.show();

                    // Initialize Stripe with your publishable key
                    const stripe = Stripe("pk_test_51S8g09G1BPmhi92LNy4rhU7VQesGK4REMA8ZMw8BvuFULcBDeMqbVNcpbJ0SD3mulNIagAhVKCjvKOvpRZO0SDSe00lhb4a5XF");
                    
                    // Initialize Elements with the clientSecret
                    const elements = stripe.elements({ 
                        clientSecret: stripeData.clientSecret,
                        appearance: {
                            theme: 'stripe',
                        }
                    });

                    // Create and mount the Payment Element
                    const paymentElement = elements.create('payment');
                    paymentElement.mount('#payment-element');

                    // Handle form submission
                    const form = document.getElementById('payment-form');
                    form.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        
                        // Confirm payment without redirect
                        const { error, paymentIntent } = await stripe.confirmPayment({
                            elements,
                            redirect: "if_required" // prevents automatic page redirect
                        });

                        if (error) {
                            Swal.fire({
                                icon: "error",
                                title: "Payment Failed",
                                text: error.message,
                                confirmButtonColor: "#d33"
                            });
                        } else if (paymentIntent && paymentIntent.status === "succeeded") {

                             await fetch(`${API_BASE}/snapfix/payments/${requestId}/mark-paid`, {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify({ status: "PAID" })
                             });
                            
                            //Fetch the updated payment from backend
                            const updatedRes = await fetch(`${API_BASE}${PAY_ENDPOINT}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            const payments = await updatedRes.json();
                            const updatedPayment = payments
                                .map(normalizePayment)
                                .find(p => p.requestId === requestId);
                            
                            Swal.fire({
                                icon: "success",
                                title: "Payment Successful 🎉",
                                text: "Your payment has been processed successfully!"
                            }).then(() => {
                                securePaymentModal.hide();

                                // 🔹 Update DataTable
                                const userPayment = stripeData.userPayment; // response from backend
                                addActivity(
                                    "Payment Successful",       // action
                                    "update",                   // type (badge color)
                                    `Payment for Request #${userPayment.requestId} updated to ${userPayment.method}. Amount: LKR ${userPayment.amount}` // description
                                );
                                const rowIndex = $paymentsTable.rows().eq(0).filter(idx =>
                                    $paymentsTable.row(idx).data().requestId === userPayment.requestId
                                );

                                if (rowIndex.length) {
                                    $paymentsTable.row(rowIndex[0]).data(userPayment).draw(false);
                                } else {
                                    $paymentsTable.row.add(userPayment).draw(false);
                                }

                                const $card = $(`.save-method[data-id='${userPayment.requestId}']`).closest(".card");
                                $card.find(".status-badge")
                                    .removeClass("status-pending status-paid")
                                    .addClass("status-paid")
                                    .text("Paid");
                                $card.find(".save-method").prop("disabled", true).text("Payment Completed");
                            });
                        }else {
                            Swal.fire({
                                icon: "info",
                                title: "Payment Pending",
                                text: "Your payment requires additional action.",
                                confirmButtonColor: "#3085d6"
                            });
                        }
                    });

                    // Close modal handler
                    $('#securePaymentModal').on('hidden.bs.modal', function () {
                        paymentElement.unmount();
                    });

                } else {
                    // 🔹 CASH flow = only update DB
                    const res = await fetch(`${API_BASE}/snapfix/payments/service/${requestId}`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ method: newMethod })
                    });

                    if (!res.ok) throw new Error(`Failed to update method: ${res.status}`);

                    const updatedPayment = normalizePayment(await res.json());

                    // 🔹 Add user & technician info from card
                    updatedPayment.userName = $card.find(".info-value").eq(0).text();
                    updatedPayment.technicianName = $card.find(".info-value").eq(1).text();

                    updatedPayment.paymentDate = new Date().toLocaleString();

                    addActivity(
                        "Payment Successful", // action
                        "update",          // type (badge color)
                        `Payment for Request #${updatedPayment.requestId} updated to ${newMethod}. Amount: LKR ${updatedPayment.amount}` // description
                    );

                    Swal.fire("Success", "Payment updated!", "success");

                    // Update card UI
                    const isPaid = updatedPayment.status === "PAID";
                    $card.find(".status-badge")
                        .removeClass("status-pending status-paid")
                        .addClass(isPaid ? "status-paid" : "status-pending")
                        .text(isPaid ? "Paid" : "Pending");

                    $card.find(".save-method").prop("disabled", isPaid)
                        .text(isPaid ? "Payment Completed" : "Pay Now");

                    // Update DataTable row
                    const rowIndex = $paymentsTable.rows().eq(0).filter(idx =>
                        $paymentsTable.row(idx).data().requestId === updatedPayment.requestId
                    );
                    if (rowIndex.length) {
                        $paymentsTable.row(rowIndex[0]).data(updatedPayment).draw(false);
                    } else {
                        $paymentsTable.row.add(updatedPayment).draw(false);
                    }

                }

            } catch (err) {
                console.error(err);
                Swal.fire("Error", err.message, "error");
            } finally {
                $spinner.addClass("d-none");
            }
        });

    }

    function renderTable(payments) {
        const tableData = payments.map(normalizePayment).filter(p => ["CASH", "CARD", "ONLINE"].includes(p.method) && p.status !== "PENDING");
        $paymentsTable.clear();
        $paymentsTable.rows.add(tableData);
        $paymentsTable.draw();
    }

    fetchUserPayments();
});
