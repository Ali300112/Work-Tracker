const monthlyTableBody = document.querySelector("#monthlyTable tbody");
const monthTotal = document.getElementById("monthTotal");
const exportPDFBtn = document.getElementById("exportPDF");

async function loadMonthly() {
    const res = await fetch("/api/data");
    const data = await res.json();

    monthlyTableBody.innerHTML = "";
    let totalMinutes = 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    for (let date in data) {
        const d = new Date(date);
        if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) continue;

        const h = Math.floor(data[date]/60);
        const m = data[date] % 60;
        totalMinutes += data[date];

        const tr = document.createElement("tr");
        tr.innerHTML=`
            <td data-label="Date">${date}</td>
            <td data-label="Hours Worked">${h}h ${m}m</td>
            <td data-label="Actions">
                <button class="action-btn edit-btn" onclick="editDay('${date}', ${data[date]})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteDay('${date}')">Delete</button>
            </td>
        `;
        monthlyTableBody.appendChild(tr);
    }

    const th = Math.floor(totalMinutes/60);
    const tm = totalMinutes % 60;
    monthTotal.textContent = `Total this month: ${th}h ${tm}m`;
}

// Edit / Delete functions
async function deleteDay(date){
    if(!confirm("Are you sure you want to delete this day?")) return;
    await fetch(`/api/delete/${date}`, { method:"DELETE" });
    loadMonthly();
}

function editDay(date, minutes){
    const newMinutes = prompt(`Edit hours for ${date} (in minutes):`, minutes);
    if(newMinutes === null) return;

    fetch("/api/save", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ date, minutes: parseInt(newMinutes) })
    }).then(() => loadMonthly());
}

// Export PDF
exportPDFBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Monthly Work Report", 10, 10);

    let y = 20;
    doc.setFontSize(12);

    // Table Header
    doc.text("Date", 10, y);
    doc.text("Hours Worked", 60, y);
    y += 8;

    // Table Rows
    Array.from(monthlyTableBody.rows).forEach(row => {
        const date = row.cells[0].innerText;
        const hours = row.cells[1].innerText;
        doc.text(date, 10, y);
        doc.text(hours, 60, y);
        y += 8;
    });

    // Total
    doc.text(monthTotal.innerText, 10, y + 10);

    doc.save("Monthly_Report.pdf");
});

loadMonthly();