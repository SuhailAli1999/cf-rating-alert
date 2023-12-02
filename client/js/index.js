document.addEventListener("DOMContentLoaded", function () {

    const subscribeButton = document.getElementById("subscribe");
    subscribeButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(document.getElementById("form"));
        const formDataObject = {};

        // Convert FormData to a plain object
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });
        fetch("http://localhost:3000/subscribe", {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formDataObject), // Convert the object to JSON
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.error == 'You are actually subscribed') {
                    console.log("You are actually subscribed");
                    document.getElementById("error").innerText = "You are actually subscribed";
                    document.getElementById("error").style.display = "block";
                    document.getElementById("alert").style.display = "none";
                    document.getElementById("error").style.backgroundColor = "#63f05e";
                }
                else if (data.error == 'Enter your handle') {
                    console.log("Enter your handle");
                    document.getElementById("error").innerText = "Enter your handle";
                    document.getElementById("error").style.display = "block";
                    document.getElementById("alert").style.display = "none";
                    document.getElementById("error").style.backgroundColor = "#f36464";

                }
                else if (data.error == 'User with this handle not found') {
                    console.log("User with this handle not found");
                    document.getElementById("error").innerText = "User with this handle not found";
                    document.getElementById("error").style.display = "block";
                    document.getElementById("alert").style.display = "none";
                    document.getElementById("error").style.backgroundColor = "#f36464";
                }
                else if (data.error == "your contact information should be public") {
                    console.log("your contact information should be public");
                    document.getElementById("error").innerText = "your contact information should be public";
                    document.getElementById("error").style.display = "block";
                    document.getElementById("error").style.backgroundColor = "#f36464";
                }
                else {
                    localStorage.setItem('email', data.email);
                    window.location.href = "http://127.0.0.1:5500/client/subscribeVerify.html";
                }
            })
            .catch(error => {
                console.log("error", error);
            });
    });

    const unsubscribeButton = document.getElementById("unsubscribe");

    unsubscribeButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(document.getElementById("form"));
        const formDataObject = {};

        // Convert FormData to a plain object
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });

        fetch("http://localhost:3000/unsubscribe", {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formDataObject), // Convert the object to JSON
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.error == 'You are actually unsubscribed') {
                    console.log("You are actually unsubscribed");
                    document.getElementById("error").innerText = "You are actually unsubscribed";
                    document.getElementById("error").style.display = "block";
                    document.getElementById("alert").style.display = "none";
                    document.getElementById("error").style.backgroundColor = "#63f05e";
                }
                else if (data.error == 'Enter your handle') {
                    console.log("Enter your handle");
                    document.getElementById("error").innerText = "Enter your handle";
                    document.getElementById("error").style.display = "block";
                    document.getElementById("alert").style.display = "none";
                    document.getElementById("error").style.backgroundColor = "#f36464";
                }
                else {
                    localStorage.setItem('email', data.email);
                    window.location.href = "http://127.0.0.1:5500/client/unsubscribeVerify.html";
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });
    });
});
