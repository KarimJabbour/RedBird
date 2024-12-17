document.addEventListener("DOMContentLoaded", () => {

  const userIconLink = document.getElementById("user-icon-link");
  const dropdownMenu = document.getElementById("dropdown-menu");

  userIconLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (dropdownMenu.style.display === "block") {
          dropdownMenu.style.display = "none";
      } else {
          dropdownMenu.style.display = "block";
      }

  });

});
