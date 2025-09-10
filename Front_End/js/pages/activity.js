$(document).ready(function() {
    renderActivities();
});

function addActivity(action, type, description) {
    const now = new Date();
    const dateString = now.toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit"
    });

    const timelineItem = {
        date: dateString,
        action, type, description
    };

    // Get existing activities
    let activities = JSON.parse(localStorage.getItem("activities")) || [];
    activities.unshift(timelineItem); // newest first
    localStorage.setItem("activities", JSON.stringify(activities));

    renderActivities();
}

function renderActivities() {
    const timeline = $("#activityTimeline");
    timeline.empty();

    const activities = JSON.parse(localStorage.getItem("activities")) || [];
    activities.forEach(act => {
        const item = `
            <div class="timeline-item">
                <div class="timeline-date">${act.date}</div>
                <div class="timeline-content">
                    <div class="d-flex justify-content-between">
                        <strong>${act.action}</strong>
                        <span class="badge bg-${getBadgeColor(act.type)}">${act.type}</span>
                    </div>
                    <p class="mb-0">${act.description}</p>
                </div>
            </div>
        `;
        timeline.append(item);
    });
}
function getBadgeColor(type) {
    switch(type.toLowerCase()) {
        case "update": return "success";
        case "login": return "primary";
        case "support": return "warning";
        case "report": return "info";
        case "new": return "secondary";
        case "create": return "dark"; // optional for registration
        default: return "dark";
    }
}

