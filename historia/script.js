document.addEventListener("DOMContentLoaded", function () {
    const stars = document.querySelectorAll(".star");
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener("click", function () {
            selectedRating = this.getAttribute("data-value");
            stars.forEach(s => s.classList.remove("active"));
            this.classList.add("active");
            for (let i = 0; i < selectedRating; i++) {
                stars[i].classList.add("active");
            }
        });
    });

    document.getElementById("feedbackForm").addEventListener("submit", function (e) {
        e.preventDefault();
        alert("Thank you for your feedback!");
        this.reset();
        stars.forEach(s => s.classList.remove("active"));
    });
});
    function logoutUser() {
    sessionStorage.removeItem("loggedIn"); // Remove login session
    alert("You have been logged out.");
    window.location.href = "login11.html"; // Redirect to login page
}
