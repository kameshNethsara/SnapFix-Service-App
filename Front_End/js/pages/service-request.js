// ================== CONFIG ==================
const API_BASE = "http://localhost:8080/snapfix";
const SERVICE_REQUESTS_ENDPOINT = "/service-requests";
const IMGBB_API_KEY = "ba48954b39f744891fd598cf3b058597";
// ============================================

let currentUser = null;
let uploadedFiles = []; // store selected files before uploading
let requestsTable = null; // store DataTable instance

$(document).ready(function () {
    const selectedTechId = localStorage.getItem("selectedTechnicianId");
    const selectedTechName = localStorage.getItem("selectedTechnicianName");

    console.log(`Technician ${selectedTechName} (ID: ${selectedTechId}) selected and saved to localStorage.`);

    if (selectedTechId && selectedTechName) {
        $("#technicianField").val(selectedTechName);
        $("#hiddenTechnicianId").val(selectedTechId);
    }

    initializePage();
    loadDraft();
});

// ---------------- INIT ----------------
async function initializePage() {
    try {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            currentUser = {
                userId: parseInt(localStorage.getItem("userId")),
                username: localStorage.getItem("username"),
                role: localStorage.getItem("role")
            };
        }

        setupEventListeners();
        setupDataTable();
        await loadUserRequests();
    } catch (error) {
        console.error("Initialization error:", error);
        showAlert("error", "Failed to initialize page");
    }
}

// ---------------- EVENTS ----------------
function setupEventListeners() {
    $("#description").on("input", function () {
        $("#descCount").text(`${this.value.length}/1500`);
    });

    $("#btnSaveDraft").on("click", saveDraft);
    $("#btnReset").on("click", resetForm);
    $("#serviceRequestForm").on("submit", handleFormSubmit);

    setupDropzone();
}

// ---------------- DROPZONE ----------------
function setupDropzone() {
    const dropzone = $("#dropzone");
    const photosInput = $("#photos");

    dropzone.on("click", function (e) {
        e.stopPropagation();
        photosInput.trigger("click");
    });

    dropzone.on("dragover", function (e) {
        e.preventDefault();
        dropzone.addClass("dragover");
    });

    dropzone.on("dragleave dragend drop", function (e) {
        e.preventDefault();
        dropzone.removeClass("dragover");
    });

    dropzone.on("drop", function (e) {
        e.preventDefault();
        const files = Array.from(e.originalEvent.dataTransfer.files);
        handleDroppedFiles(files);
    });

    photosInput.on("change", function (e) {
        const files = Array.from(e.target.files);
        handleDroppedFiles(files);
        photosInput.val('');
    });
}

function handleDroppedFiles(files) {
    const MAX_FILES = 5;
    const MAX_MB = 5;
    const spaceLeft = MAX_FILES - uploadedFiles.length;

    if (files.length > spaceLeft) {
        showAlert("warning", `You can only upload ${spaceLeft} more files.`);
    }

    for (let i = 0; i < Math.min(files.length, spaceLeft); i++) {
        const file = files[i];

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showAlert("warning", `File "${file.name}" is not JPG/PNG.`);
            continue;
        }

        if (file.size > MAX_MB * 1024 * 1024) {
            showAlert("warning", `File "${file.name}" must be under ${MAX_MB} MB.`);
            continue;
        }

        uploadedFiles.push(file);
        addFilePreview(file);
    }
}

function addFilePreview(file) {
    const preview = $("#preview");
    const wrapper = $('<div class="preview position-relative d-inline-block me-2 mb-2"></div>');
    const img = $('<img>')
        .attr("src", URL.createObjectURL(file))
        .addClass("img-thumbnail")
        .css({ width: '100px', height: '100px', objectFit: 'cover' });
    const removeBtn = $('<button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0"><i class="fa-solid fa-xmark"></i></button>');

    removeBtn.on("click", function () {
        const index = uploadedFiles.indexOf(file);
        if (index > -1) uploadedFiles.splice(index, 1);
        wrapper.remove();
    });

    wrapper.append(img, removeBtn);
    preview.append(wrapper);
}

// ---------------- FORM SUBMIT ----------------
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        showAlert("error", "Please fill all required fields correctly.");
        return;
    }

    if (!currentUser) {
        showAlert("warning", "Please log in to submit a service request.");
        return;
    }

    try {
        // show loading
        $("#loadingOverlay").show();

        let imageUrls = [];
        if (uploadedFiles.length > 0) {
            imageUrls = await Promise.all(
                uploadedFiles.map(file => uploadImageToImgbb(file))
            );
        }

        const technicianId = $("#hiddenTechnicianId").val();

        const requestData = {
            userId: currentUser.userId,
            title: $("#title").val(),
            category: $("#category").val(),
            description: $("#description").val(),
            priority: $("#priority").val(),
            preferredDateTime: buildDateTime(),
            street: $("#street").val(),
            city: $("#city").val(),
            postalCode: $("#postalCode").val(),
            phone: $("#phone").val(),
            photoUrls: imageUrls
        };

        // ✅ Only add technicianIds if a technician was selected
        if (technicianId) {
            requestData.assignedTechnicianIds = [parseInt(technicianId)];
        }

        const token = localStorage.getItem("jwtToken");
        const response = await fetch(`${API_BASE}${SERVICE_REQUESTS_ENDPOINT}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || "Failed to create service request");
        }

        await response.json();
        showAlert("success", "Service request created successfully!");
        addActivity("Created Service Request", "Create", `You created a new service request titled "${requestData.title}".`);
        Swal.fire("Success", "Service request created successfully!", "success");
        resetForm();
        localStorage.removeItem("selectedTechnicianId");
        localStorage.removeItem("selectedTechnicianName");

        await loadUserRequests();

    } catch (error) {
        console.error("Submission error:", error);
        showAlert("error", error.message || "Failed to submit service request");
        Swal.fire("Error", error.message || "Failed to submit service request", "error");
    } finally {
        // hide loading
        $("#loadingOverlay").hide();
    }
}

async function uploadImageToImgbb(file) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error?.message || "Image upload failed");
    return data.data.url;
}

function buildDateTime() {
    const date = $("#preferredDate").val();
    let time = $("#preferredTime").val();

    if (time && (time.includes("AM") || time.includes("PM"))) {
        const [hourMinute, ampm] = time.split(" ");
        let [hours, minutes] = hourMinute.split(":").map(Number);
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }

    if (date) return time ? `${date}T${time}:00` : `${date}T00:00:00`;
    return null;
}

// ---------------- REQUESTS TABLE ----------------
async function loadUserRequests() {
    if (!currentUser) return;

    try {
        const token = localStorage.getItem("jwtToken");
        const response = await fetch(`${API_BASE}${SERVICE_REQUESTS_ENDPOINT}/user/${currentUser.userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const requests = await response.json();
            populateRequestsTable(requests);
        }
    } catch (error) {
        console.error("Error loading requests:", error);
    }
}

// function populateRequestsTable(requests) {
//     if (!requestsTable) return;

//     requestsTable.clear();
//     requests.forEach(request => {
//         requestsTable.row.add([
//             request.requestId,
//             request.title,
//             request.category,
//             request.description.substring(0, 50) + (request.description.length > 50 ? "..." : ""),
//             request.priority,
//             `<span class="badge bg-${getStatusBadgeClass(request.status)}">${request.status}</span>`,
//             request.preferredDateTime ? new Date(request.preferredDateTime).toLocaleDateString() : "Not specified"
//         ]);
//     });
//     requestsTable.draw();
// }
// function populateRequestsTable(requests) {
//     if (!requestsTable) return;

//     requestsTable.clear();
//     requests.forEach(request => {
//         requestsTable.row.add([
//             request.requestId, // hidden column
//             null,              // row number auto generate wenawa render walin
//             request.title,
//             request.category,
//             request.description.substring(0, 50) + (request.description.length > 50 ? "..." : ""),
//             request.priority,
//             `<span class="badge bg-${getStatusBadgeClass(request.status)}">${request.status}</span>`,
//             request.preferredDateTime ? new Date(request.preferredDateTime).toLocaleDateString() : "Not specified"
//         ]);
//     });
//     requestsTable.draw();
// }
function populateRequestsTable(requests) {
    if (!requestsTable) return;

    requestsTable.clear();
    requests.forEach(request => {
        // Prefer technicianId from DTO, fallback to assignedTechnicianIds[0]
        const techId = request.technicianId || request.assignedTechnicianIds?.[0] || null;
        const techName = request.technicianName || "N/A";

        const actionBtn = request.status?.toUpperCase() === "COMPLETED"
            ? `<button class="btn btn-sm btn-success btnRate" 
                    data-id="${request.requestId}" 
                    data-tech-id="${techId}" 
                    data-tech-name="${techName}">
                <i class="fa-solid fa-star me-1"></i>Rate
            </button>`
            : `<button class="btn btn-sm btn-secondary" disabled>
                <i class="fa-solid fa-star me-1"></i>Rate
            </button>`;

        requestsTable.row.add([
            request.requestId, // hidden column
            null,              // serial number
            request.title,
            request.category,
            request.description.substring(0, 50) + (request.description.length > 50 ? "..." : ""),
            request.priority,
            `<span class="badge bg-${getStatusBadgeClass(request.status)}">${request.status}</span>`,
            request.preferredDateTime ? new Date(request.preferredDateTime).toLocaleDateString() : "Not specified",
            actionBtn
        ]);
    });
    requestsTable.draw();

    $("#requestsTable").off("click", ".btnRate").on("click", ".btnRate", function () {
        const requestId = $(this).data("id");
        const technicianId = $(this).data("tech-id");
        const technicianName = $(this).data("tech-name");

        localStorage.setItem("selectedRequestId", requestId);
        localStorage.setItem("selectedTechnicianId", technicianId);
        localStorage.setItem("selectedTechnicianName", technicianName);

        window.location.href = "/Front_End/html/pages/ratings-user.html";
    });
}



function getStatusBadgeClass(status) {
    switch (status?.toUpperCase()) {
        case "PENDING": return "warning";
        case "APPROVED": return "info";
        case "IN_PROGRESS": return "primary";
        case "COMPLETED": return "success";
        case "CANCELLED": return "danger";
        default: return "secondary";
    }
}

// function setupDataTable() {
//     if (!$.fn.DataTable.isDataTable("#requestsTable")) {
//         requestsTable = $("#requestsTable").DataTable({
//             responsive: true,
//             ordering: true,
//             searching: true
//         });
//     }
// }
function setupDataTable() {
    if (!$.fn.DataTable.isDataTable("#requestsTable")) {
        requestsTable = $("#requestsTable").DataTable({
            responsive: true,
            ordering: true,
            searching: true,
            order: [[0, "desc"]], // requestId column (hidden) desc -> latest first
            columnDefs: [
                {
                    targets: 0, // requestId hidden
                    visible: false,
                    searchable: false
                },
                {
                    targets: 1, // serial number
                    render: function (data, type, row, meta) {
                        return meta.row + 1;
                    }
                }
            ]
        });
    }
}


// ---------------- UTIL ----------------
function showAlert(type, message) {
    Swal.fire({
        icon: type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        text: message,
        confirmButtonColor: "#3085d6"
    });
}

function resetForm() {
    $("#serviceRequestForm")[0].reset();
    $("#preview").empty();
    $("#descCount").text("0/1500");
    $("#serviceRequestForm").removeClass("was-validated");
    uploadedFiles = [];
    localStorage.removeItem("serviceRequestDraft");
}

function saveDraft() {
    const formData = {
        title: $("#title").val(),
        category: $("#category").val(),
        description: $("#description").val(),
        priority: $("#priority").val(),
        preferredDate: $("#preferredDate").val(),
        preferredTime: $("#preferredTime").val(),
        street: $("#street").val(),
        city: $("#city").val(),
        postalCode: $("#postalCode").val(),
        phone: $("#phone").val()
    };

    localStorage.setItem("serviceRequestDraft", JSON.stringify(formData));
    addActivity("Saved Draft", "Save", "You saved a draft of a service request.");
    showAlert("info", "Draft saved successfully!");
}

function loadDraft() {
    const draft = localStorage.getItem("serviceRequestDraft");
    if (draft) {
        const formData = JSON.parse(draft);
        Object.keys(formData).forEach(key => $(`#${key}`).val(formData[key]));
        $("#descCount").text(`${formData.description.length}/1500`);
    }
}
