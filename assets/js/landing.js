const canvas = document.getElementById("feather-animation");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let feathers = [];

featherImages = [
    "Images/feathers/F11D28_feather.png",
    "Images/feathers/FD3A2D_feather.png",
    "Images/feathers/FE612C_feather.png",
    "Images/feathers/FF872C_feather.png",
    "Images/feathers/FFA12C_feather.png",
];

const loadedFeathers = featherImages.map((src) => {
    const img = new Image();
    img.src = src;
    return img;
});

class Feather {
    constructor(x, y, size, speedX, speedY, swaySpeed, rotation, image) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.swaySpeed = swaySpeed;
        this.rotation = rotation;
        this.angle = Math.random() * Math.PI * 2;
        this.image = image;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation + Math.sin(this.angle) * 0.3);
        ctx.scale(this.size, this.size);
        ctx.drawImage(
            this.image,
            -this.image.width / 2,
            -this.image.height / 2,
            this.image.width,
            this.image.height
        );
        ctx.restore();
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.angle) * this.swaySpeed;
        this.angle += 0.01;

        if (this.y > canvas.height) {
            this.y = -Math.random() * 50;
            this.x = Math.random() * canvas.width;
            this.rotation = Math.random() * Math.PI * 2;
            this.image = loadedFeathers[Math.floor(Math.random() * loadedFeathers.length)];
        }
    }
}

function initFeathers() {
    feathers = [];
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 0.15 + 0.05;
        const speedX = Math.random() * 0.3 - 0.15;
        const speedY = Math.random() * 1.2 + 0.5;
        const swaySpeed = Math.random() * 0.2 + 0.1;
        const rotation = Math.random() * Math.PI * 2;
        const image = loadedFeathers[Math.floor(Math.random() * loadedFeathers.length)];
        feathers.push(new Feather(x, y, size, speedX, speedY, swaySpeed, rotation, image));
    }
}

function animateFeathers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    feathers.forEach((feather) => {
        feather.update();
        feather.draw();
    });
    requestAnimationFrame(animateFeathers);
}

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initFeathers();
});

Promise.all(loadedFeathers.map((img) => new Promise((res) => (img.onload = res)))).then(() => {
    initFeathers();
    animateFeathers();
});

function goToBooking() {
    const bookingId = document.getElementById('booking-id').value;
    if (bookingId) {
        window.location.href = `book_meeting.html?id=${bookingId}`;
    } else {
        alert('Please enter a valid Booking ID.');
    }
}

function goToPoll() {
    const pollId = document.getElementById('poll-id').value;
    if (pollId) {
        window.location.href = `answer_poll.html?pollID=${pollId}`;
    } else {
        alert('Please enter a valid Poll ID.');
    }
}
