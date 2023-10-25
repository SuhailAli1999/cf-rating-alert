document.addEventListener("DOMContentLoaded", function () {

    const unsubscribeVerifyButton = document.getElementById("unsubscribeOtp");

    unsubscribeVerifyButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(document.getElementById("form"));
        const formDataObject = {};

        // Convert FormData to a plain object
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });
        formDataObject["email"] = localStorage.getItem('email');

        fetch("http://localhost:3000/verify/unsubscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formDataObject), // Convert the object to JSON
        })
            .then(response => response.json())
            .then(data => {
                if (data.error == 'Invalid OTP') {
                    document.getElementById("error").innerText = "Invalid OTP";
                    document.getElementById("error").style.display = "block";
                    document.getElementById("error").style.backgroundColor = "#f36464";
                }
                else {
                    localStorage.removeItem("email");
                    window.location.href = "http://127.0.0.1:5500/client/unsubscribedSuccessfully.html";
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });
    });
});