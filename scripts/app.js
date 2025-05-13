document.addEventListener('DOMContentLoaded', () => {
    const worldTimezoneSelect = document.getElementById('worldTimezoneSelect');
    const calendarTypeSelect = document.getElementById('calendarType');
    const calendarContainer = document.getElementById('calendar');
    const monthText = document.getElementById('monthText');
    const cardPreview = document.getElementById('cardPreview');
    let imageBase64 = "";

    // Theme Toggle Functionality
    document.getElementById('themeToggle').addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });

    // Populate timezones
    const timezones = Intl.supportedValuesOf
        ? Intl.supportedValuesOf('timeZone')
        : ['UTC', 'Asia/Karachi', 'America/New_York'];
    timezones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz;
        option.textContent = tz;
        worldTimezoneSelect.appendChild(option);
    });

    function drawClock(canvasId, time) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const radius = canvas.width / 2;

        ctx.save();
        ctx.translate(radius, radius);
        ctx.clearRect(-radius, -radius, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.arc(0, 0, radius - 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();

        const hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();

        // Hour hand
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
            Math.cos((hours % 12) * Math.PI / 6 - Math.PI / 2) * radius * 0.5,
            Math.sin((hours % 12) * Math.PI / 6 - Math.PI / 2) * radius * 0.5
        );
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Minute hand
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
            Math.cos(minutes * Math.PI / 30 - Math.PI / 2) * radius * 0.7,
            Math.sin(minutes * Math.PI / 30 - Math.PI / 2) * radius * 0.7
        );
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Second hand
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
            Math.cos(seconds * Math.PI / 30 - Math.PI / 2) * radius * 0.9,
            Math.sin(seconds * Math.PI / 30 - Math.PI / 2) * radius * 0.9
        );
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    function updateClocks() {
        const now = new Date();
        drawClock('currentClock', now);

        const selectedTimezone = worldTimezoneSelect.value;
        const worldTime = new Date(now.toLocaleString('en-US', { timeZone: selectedTimezone }));
        drawClock('worldClock', worldTime);
    }

    function updateMonthText() {
        const now = new Date();
        const day = now.toLocaleDateString(undefined, { weekday: 'long' });
        const month = now.toLocaleDateString(undefined, { month: 'long' });
        const date = now.getDate();
        monthText.textContent = `${month} ${date} — ${day}`;
    }

    function updateCalendar() {
        const type = calendarTypeSelect.value;
        const now = new Date();

        if (type === 'gregorian') {
            const year = now.getFullYear();
            const month = now.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            let html = `<table style="width:100%; text-align:center;"><tr>`;
            for (let d = 0; d < 7; d++) {
                const dayName = new Date(2024, 0, d + 1).toLocaleDateString(undefined, { weekday: 'short' });
                html += `<th>${dayName}</th>`;
            }
            html += `</tr><tr>`;

            const firstDay = new Date(year, month, 1).getDay();
            for (let i = 0; i < firstDay; i++) {
                html += `<td></td>`;
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                html += `<td>${day}</td>`;
                if (date.getDay() === 6) html += `</tr><tr>`;
            }

            html += `</tr></table>`;
            calendarContainer.innerHTML = html;
        } else if (type === 'islamic') {
            calendarContainer.innerHTML = `<p>Islamic Calendar: ${now.toLocaleDateString('en-TN-u-ca-islamic')}</p>`;
        } else if (type === 'hebrew') {
            calendarContainer.innerHTML = `<p>Hebrew Calendar: ${now.toLocaleDateString('en-US-u-ca-hebrew')}</p>`;
        }
    }

    function loadImage(event) {
        const reader = new FileReader();
        reader.onload = () => {
            imageBase64 = reader.result;
            document.getElementById('preview').src = imageBase64;
            updateCardPreview();
        };
        reader.readAsDataURL(event.target.files[0]);
    }

    function updateCardPreview() {
        const form = document.getElementById('walletForm');
        const formData = new FormData(form);
        cardPreview.innerHTML = `
            <img src="${document.getElementById('preview').src}" alt="Profile" />
            <p><strong>Name:</strong> ${formData.get('fullName') || ''}</p>
            <p><strong>Card:</strong> ${formData.get('cardType') || ''} ${formData.get('cardNumber') || ''}</p>
            <p><strong>Expires:</strong> ${formData.get('expiryMonth') || ''}/${formData.get('expiryYear') || ''}</p>
        `;
    }

    function saveWallet() {
        const form = document.getElementById('walletForm');
        const formData = new FormData(form);

        const profilePic = document.getElementById('preview').src;
        const fullName = formData.get('fullName');
        const address = formData.get('address');
        const phone = formData.get('phone');
        const email = formData.get('email');
        const zip = formData.get('zip');
        const city = formData.get('city');
        const province = formData.get('province');
        const cardNumber = formData.get('cardNumber');
        const cardType = formData.get('cardType');
        const expiryMonth = formData.get('expiryMonth');
        const expiryYear = formData.get('expiryYear');
        const cvv = formData.get('cvv');

        const htmlContent = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Saved Wallet</title></head>
<body style="font-family:Segoe UI,sans-serif;max-width:600px;margin:auto;padding:20px;">
  <h1 style="text-align:center;color:#f44336;">Saved Wallet</h1>
  <div style="background:#fff;padding:20px;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.1);">
    <img src="${profilePic}" style="max-width:150px;display:block;margin:auto;border-radius:50%;" />
    <p><strong>Full Name:</strong> ${fullName}</p>
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Zip Code:</strong> ${zip}</p>
    <p><strong>City:</strong> ${city}</p>
    <p><strong>Province:</strong> ${province}</p>
    <p><strong>Card Number:</strong> ${cardNumber}</p>
    <p><strong>Card Type:</strong> ${cardType}</p>
    <p><strong>Expiry:</strong> ${expiryMonth}/${expiryYear}</p>
    <p><strong>CVV:</strong> ${cvv}</p>
  </div>
</body></html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'wallet.html';
        link.click();
    }

    function displayWallets() {
        const container = document.getElementById('savedWallets');
        container.innerHTML = '';
        const saved = JSON.parse(localStorage.getItem('wallets') || "[]");
        saved.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'user-card';
            div.innerHTML = `
                <img src="${entry.profilePic}" alt="Profile Image" />
                <p><strong>Name:</strong> ${entry.fullName}</p>
                <p><strong>Card:</strong> ${entry.cardType} ${entry.cardNumber}</p>
                <p><strong>Location:</strong> ${entry.city}, ${entry.province}</p>
                <p><strong>Saved At:</strong> ${entry.time}</p>
            `;
            container.appendChild(div);
        });
    }

    function downloadHTML() {
        const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'digital_wallet.html';
        a.click();
        URL.revokeObjectURL(url);
    }

    document.getElementById('downloadButton').addEventListener('click', downloadHTML);
    document.getElementById('walletForm').addEventListener('input', updateCardPreview);

    // Populate expiry date options
    const expiryMonthSelect = document.getElementById('expiryMonth');
    const expiryYearSelect = document.getElementById('expiryYear');
    const currentYear = new Date().getFullYear();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    months.forEach((month, i) => {
        const opt = new Option(month, i + 1);
        expiryMonthSelect.add(opt);
    });
    for (let i = 0; i < 10; i++) {
        const year = currentYear + i;
        expiryYearSelect.add(new Option(year, year));
    }

    // Export to PDF functionality
    document.getElementById('exportPdfButton').addEventListener('click', () => {
        const element = document.getElementById('cardPreview'); // Target the card preview section
        const options = {
            margin: 1,
            filename: 'wallet-preview.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generate PDF for the card preview
        html2pdf().set(options).from(element).save();
    });

    // Init everything
    updateCalendar();
    updateMonthText();
    updateClocks();
    displayWallets();
    setInterval(updateClocks, 1000);
    calendarTypeSelect.addEventListener('change', updateCalendar);
});
