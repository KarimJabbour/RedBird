const meetingLink = document.getElementById("meeting-link").textContent;

if (typeof QRCode !== 'undefined') {

  new QRCode(document.getElementById("qrcode"), {
    text: meetingLink,
    width: 128,
    height: 128,
    colorDark: "#000000",
    colorLight: "#ffffff",
  });
} else {
  console.error("QRCode.js library is not loaded.");
}
