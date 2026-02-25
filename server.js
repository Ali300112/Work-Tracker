const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const DATA_FILE = "data.json";

function readData() {
    if (!fs.existsSync(DATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/api/data", (req, res) => {
    res.json(readData());
});

app.post("/api/save", (req, res) => {
    const data = readData();
    data[req.body.date] = req.body.minutes;
    writeData(data);
    res.json({ success: true });
});

app.delete("/api/delete/:date", (req, res) => {
    const data = readData();
    delete data[req.params.date];
    writeData(data);
    res.json({ success: true });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});