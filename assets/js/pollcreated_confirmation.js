document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);
    const pollTitle = params.get("title") || "N/A";
    const pollDetails = params.get("details") || "N/A";
    const link = params.get('link');

    document.getElementById("poll-title").textContent = pollTitle;
    document.getElementById("poll-details").textContent = pollDetails;
    document.getElementById("link").textContent = link;

    new QRCode(document.getElementById("qrcode"), {
        text: link,
        width: 150,
        height: 150,
    });

});
