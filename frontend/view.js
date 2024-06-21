const div = document.createElement("div");
const input = document.createElement("input");
input.type = "file";
input.accept = ".svg, .xlsx";
input.onchange = async (event) => {
    const file = event.target["files"][0];
    if (!file) throw new Error("File not found")
    const formData = new FormData()
    formData.append("file", file)

    return await fetch("http://localhost:3000/api/createEvent", {
        method: "POST",
        body: formData
    }).then(response => {
        console.log(response)
    })
}

div.appendChild(input)
document.body.appendChild(div)