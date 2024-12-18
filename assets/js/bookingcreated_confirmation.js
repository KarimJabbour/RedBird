document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const title = params.get('title');
    const details = params.get('details');
    const location = params.get('location');
    const meetingLink = params.get('meeting-link');
    const attachmentLink = params.get('attachment-link');
    const link = params.get('link');

    console.log({ title, details, location, link });

    if (title) {
      document.getElementById('meeting-title').textContent = title;
    } else {
      document.getElementById('meeting-title').style.display = 'none';
    }

    if (details) {
      document.getElementById('meeting-details').textContent = details;
    } else {
      document.getElementById('meeting-details').style.display = 'none';
    }

    if (location) {
      document.getElementById('meeting-location').textContent = location;
    } else {
      document.getElementById('meeting-location').style.display = 'none';
    }

    if (attachmentLink) {
        document.getElementById('attachment-link').textContent = attachmentLink;
    } else {
        document.getElementById('attachment-link').style.display = 'none';
    }

    if (attachmentLink) {
        document.getElementById('meeting-link').textContent = meetingLink;
    } else {
        document.getElementById('attachment-link').style.display = 'none';
    }

    if (link) {
        document.getElementById('link').textContent = link;
        new QRCode(document.getElementById('qrcode'), {
            text: link,
            width: 128,
            height: 128,
        });
    } else {
        document.getElementById('link').style.display = 'none';
        document.getElementById('qrcode').style.display = 'none';
    }

});
