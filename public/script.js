const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");
const breakTime = document.getElementById("breakTime");
const calculateBtn = document.getElementById("calculateBtn");
const resultText = document.getElementById("resultText");
const monthlyBtn = document.getElementById("monthlyBtn");
const monthlyResult = document.getElementById("monthlyResult");
const logTableBody = document.querySelector("#logTable tbody");

calculateBtn.addEventListener("click", async () => {
    if(!startTime.value || !endTime.value){ resultText.textContent="Select times first"; return; }

    const start = new Date(`1970-01-01T${startTime.value}:00`);
    const end = new Date(`1970-01-01T${endTime.value}:00`);
    let diff = end - start;
    if(diff<0) diff += 24*60*60*1000;

    let totalMinutes = diff / (1000*60);
    let breakMinutes = parseInt(breakTime.value)||0;
    totalMinutes -= breakMinutes;

    const hours = Math.floor(totalMinutes/60);
    const minutes = Math.floor(totalMinutes%60);

    resultText.textContent = `${hours}h ${minutes}m`;

    const today = new Date().toISOString().split("T")[0];

    await fetch("/api/save", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({date:today, minutes:totalMinutes})
    });

    loadData();
});

async function loadData(){
    const res = await fetch("/api/data");
    const data = await res.json();

    logTableBody.innerHTML="";

    let totalMonth=0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    for(let date in data){
        let d = new Date(date);
        const h = Math.floor(data[date]/60);
        const m = Math.floor(data[date]%60);

        const tr = document.createElement("tr");
        tr.innerHTML=`
            <td>${date}</td>
            <td>${h}h ${m}m</td>
            <td>
                <button class="action-btn edit-btn" onclick="editDay('${date}', ${data[date]})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteDay('${date}')">Delete</button>
            </td>
        `;
        logTableBody.appendChild(tr);

        if(d.getMonth()===currentMonth && d.getFullYear()===currentYear){
            totalMonth+=data[date];
        }
    }

    const th = Math.floor(totalMonth/60);
    const tm = Math.floor(totalMonth%60);
    monthlyResult.textContent=`Total this month: ${th}h ${tm}m`;
}

async function deleteDay(date){
    await fetch(`/api/delete/${date}`, {method:"DELETE"});
    loadData();
}

function editDay(date, minutes){
    startTime.value = "09:00";
    endTime.value = "17:30";
    breakTime.value = 60;
    alert('عدل الوقت واضغط Calculate & Save لتحديث اليوم.');
}

loadData();