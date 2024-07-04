const QRCode = require('qrcode');
const fs = require('fs');

const data = 'locker_data.txt'; // Replace with the actual data you want to encode in the QR code

QRCode.toFile('qrcode.png', data, {
    color: {
        dark: '#000000',  // Black dots
        light: '#0000' // Transparent background
    }
}, function (err) {
    if (err) throw err;
    console.log('QR code generated and saved as qrcode.png');
});
