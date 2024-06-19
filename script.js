document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('colorWheel');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY);
    const mainColorInput = document.getElementById('mainColor');
    const eyeDropperBtn = document.getElementById('eyeDropperBtn');
    const savePaletteBtn = document.getElementById('savePaletteBtn');
    const saveHexCodesBtn = document.getElementById('saveHexCodesBtn');
    const errorMessage = document.getElementById('errorMessage');

    // Controleer of de EyeDropper API wordt ondersteund
    if (window.EyeDropper) {
        // Voeg een click event listener toe aan de knop
        eyeDropperBtn.addEventListener('click', openEyeDropper);
    } else {
        // Toon een foutmelding als de API niet wordt ondersteund
        errorMessage.style.display = 'block';
    }

    async function openEyeDropper() {
        try {
            // Maak een nieuw EyeDropper object
            const eyeDropper = new EyeDropper();
            
            // Open de EyeDropper en wacht op de geselecteerde kleur
            const { sRGBHex } = await eyeDropper.open();
            
            // Zet de geselecteerde kleur in de input als hexcode
            mainColorInput.value = sRGBHex;
            updateColors(sRGBHex);
        } catch (err) {
            // Behandel eventuele fouten (bijv. als de gebruiker de EyeDropper annuleert)
            console.error(err);
        }
    }

    function drawColorWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= radius) {
                    const angle = Math.atan2(dy, dx) + Math.PI;
                    const hue = angle * 180 / Math.PI;
                    const saturation = distance / radius;
                    const [r, g, b] = hsvToRgb(hue, saturation, 1);
                    const index = (y * canvas.width + x) * 4;
                    data[index] = r;
                    data[index + 1] = g;
                    data[index + 2] = b;
                    data[index + 3] = 255;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function hsvToRgb(h, s, v) {
        let r, g, b;
        const i = Math.floor(h / 60);
        const f = h / 60 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function getColorAtPoint(x, y) {
        const imageData = ctx.getImageData(x, y, 1, 1).data;
        return `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
    }

    function rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    }

    function updateColors(hexColor) {
        const mainColor = hexColor;
        const hsv = hexToHsv(mainColor);
        const complementaryHue = (hsv.h + 180) % 360;
        const analogHue1 = (hsv.h + 30) % 360;
        const analogHue2 = (hsv.h - 30 + 360) % 360;
        const complementaryColor = hsvToHex(complementaryHue, hsv.s, hsv.v);
        const analogColor1 = hsvToHex(analogHue1, hsv.s, hsv.v);
        const analogColor2 = hsvToHex(analogHue2, hsv.s, hsv.v);

        document.getElementById('mainColor').value = mainColor;
        document.getElementById('mainColor').style.backgroundColor = mainColor;
        document.getElementById('mainColorBox').style.backgroundColor = mainColor;
        document.getElementById('complementaryColor').value = complementaryColor;
        document.getElementById('complementaryColor').style.backgroundColor = complementaryColor;
        document.getElementById('complementaryColorBox').style.backgroundColor = complementaryColor;
        document.getElementById('analogColor1').value = analogColor1;
        document.getElementById('analogColor1').style.backgroundColor = analogColor1;
        document.getElementById('analogColorBox1').style.backgroundColor = analogColor1;
        document.getElementById('analogColor2').value = analogColor2;
        document.getElementById('analogColor2').style.backgroundColor = analogColor2;
        document.getElementById('analogColorBox2').style.backgroundColor = analogColor2;
    }

    function hexToHsv(hex) {
        const { r, g, b } = hexToRgb(hex);
        let rr = r / 255, gg = g / 255, bb = b / 255;
        let max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
        let h, s, v = max;
        let d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case rr: h = (gg - bb) / d + (gg < bb ? 6 : 0); break;
                case gg: h = (bb - rr) / d + 2; break;
                case bb: h = (rr - gg) / d + 4; break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s, v: v };
    }

    function hsvToHex(h, s, v) {
        let r, g, b;
        const i = Math.floor(h / 60);
        const f = h / 60 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }

        return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    }

    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const color = getColorAtPoint(x, y);
        const hexColor = rgbToHex(...color.match(/\d+/g).map(Number));
        updateColors(hexColor);
    });

    document.getElementById('mainColor').addEventListener('input', function(event) {
        const hexColor = event.target.value.trim();
        if (/^#[0-9A-F]{6}$/i.test(hexColor)) {
            updateColors(hexColor);
        } else {
            //alert("Ongeldige hex-code. Gebruik het formaat #RRGGBB.");
        }
    });

    savePaletteBtn.addEventListener('click', function() {
        const paletteCanvas = document.createElement('canvas');
        paletteCanvas.width = 128;
        paletteCanvas.height = 32;
        const paletteCtx = paletteCanvas.getContext('2d');

        const colors = [
            document.getElementById('mainColor').value,
            document.getElementById('complementaryColor').value,
            document.getElementById('analogColor1').value,
            document.getElementById('analogColor2').value
        ];

        colors.forEach((color, index) => {
            paletteCtx.fillStyle = color;
            paletteCtx.fillRect(index * 32, 0, 32, 32);
        });

        const link = document.createElement('a');
        link.download = 'kleurenpalet.png';
        link.href = paletteCanvas.toDataURL();
        link.click();
    });

    saveHexCodesBtn.addEventListener('click', function() {
        const mainColor = document.getElementById('mainColor').value;
        const complementaryColor = document.getElementById('complementaryColor').value;
        const analogColor1 = document.getElementById('analogColor1').value;
        const analogColor2 = document.getElementById('analogColor2').value;

        const textContent = `Hoofdkleur:\n${mainColor}\nComplementaire kleur:\n${complementaryColor}\nAnaloge kleuren:\n${analogColor1}\n${analogColor2}`;

        const blob = new Blob([textContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.download = 'kleurenpalet.txt';
        link.href = window.URL.createObjectURL(blob);
        link.click();
    });

    drawColorWheel();
});
