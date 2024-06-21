const div = document.createElement("div");
const input = document.createElement("input");
input.type = "file";
input.accept = ".csv";
input.onchange = async (event) => {
    const file = event.target["files"][0];
    if (!file) throw new Error("File not found")
    const formData = new FormData()
    formData.append("file", file)

    let response = await fetch("http://localhost:3000/api/createEvent", {
        method: "POST",
        body: formData
    })
    let data = await response.json()
    let h4 = document.createElement("h4")
    h4.append(data.message)
    div.append(h4)
}

div.appendChild(input)
document.body.appendChild(div)