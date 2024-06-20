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
  
    function shadeColor(color, percent) {
      const { r, g, b } = hexToRgb(color);
      const newR = Math.round(r * percent);
      const newG = Math.round(g * percent);
      const newB = Math.round(b * percent);
      return rgbToHex(newR, newG, newB);
    }
  
    function updateColors(hexColor) {
      const mainColor = hexColor;
      const hsv = hexToHsv(mainColor);
      const complementaryHue = (hsv.h + 180) % 360;
      const analogHue1 = (hsv.h + 30) % 360;
      const analogHue2 = (hsv.h - 30 + 360) % 360;
      const analogHue3 = (hsv.h + 60) % 360;
      const analogHue4 = (hsv.h - 60 + 360) % 360;
      const complementaryColor = hsvToHex(complementaryHue, hsv.s, hsv.v);
      const analogColor1 = hsvToHex(analogHue1, hsv.s, hsv.v);
      const analogColor2 = hsvToHex(analogHue2, hsv.s, hsv.v);
      const analogColor3 = hsvToHex(analogHue3, hsv.s, hsv.v);
      const analogColor4 = hsvToHex(analogHue4, hsv.s, hsv.v);
      const monochromeColor1 = shadeColor(mainColor, 0.9);
      const monochromeColor2 = shadeColor(mainColor, 0.7);
      const monochromeColor3 = shadeColor(mainColor, 0.5);
      const monochromeColor4 = shadeColor(mainColor, 0.3);
  
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
      document.getElementById('analogColor3').value = analogColor3;
      document.getElementById('analogColor3').style.backgroundColor = analogColor3;
      document.getElementById('analogColorBox3').style.backgroundColor = analogColor3;
      document.getElementById('analogColor4').value = analogColor4;
      document.getElementById('analogColor4').style.backgroundColor = analogColor4;
      document.getElementById('analogColorBox4').style.backgroundColor = analogColor4;
      document.getElementById('monochromeColor1').value = monochromeColor1;
      document.getElementById('monochromeColor1').style.backgroundColor = monochromeColor1;
      document.getElementById('monochromeColorBox1').style.backgroundColor = monochromeColor1;
      document.getElementById('monochromeColor2').value = monochromeColor2;
      document.getElementById('monochromeColor2').style.backgroundColor = monochromeColor2;
      document.getElementById('monochromeColorBox2').style.backgroundColor = monochromeColor2;
      document.getElementById('monochromeColor3').value = monochromeColor3;
      document.getElementById('monochromeColor3').style.backgroundColor = monochromeColor3;
      document.getElementById('monochromeColorBox3').style.backgroundColor = monochromeColor3;
      document.getElementById('monochromeColor4').value = monochromeColor4;
      document.getElementById('monochromeColor4').style.backgroundColor = monochromeColor4;
      document.getElementById('monochromeColorBox4').style.backgroundColor = monochromeColor4;
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
        alert("Ongeldige hex-code. Gebruik het formaat #RRGGBB.");
      }
    });
  
    savePaletteBtn.addEventListener('click', function() {
      const paletteCanvas = document.createElement('canvas');
      paletteCanvas.width = 320;
      paletteCanvas.height = 32;
      const paletteCtx = paletteCanvas.getContext('2d');
      const colors = [
        document.getElementById('mainColor').value,
        document.getElementById('complementaryColor').value,
        document.getElementById('analogColor1').value,
        document.getElementById('analogColor2').value,
        document.getElementById('analogColor3').value,
        document.getElementById('analogColor4').value,
        document.getElementById('monochromeColor1').value,
        document.getElementById('monochromeColor2').value,
        document.getElementById('monochromeColor3').value,
        document.getElementById('monochromeColor4').value
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
      const analogColor3 = document.getElementById('analogColor3').value;
      const analogColor4 = document.getElementById('analogColor4').value;
      const monochromeColor1 = document.getElementById('monochromeColor1').value;
      const monochromeColor2 = document.getElementById('monochromeColor2').value;
      const monochromeColor3 = document.getElementById('monochromeColor3').value;
      const monochromeColor4 = document.getElementById('monochromeColor4').value;
      const textContent = `Hoofdkleur:\n${mainColor}\nComplementaire kleur:\n${complementaryColor}\nAnaloge kleuren:\n${analogColor1}\n${analogColor2}\n${analogColor3}\n${analogColor4}\nMonochromatische kleuren:\n${monochromeColor1}\n${monochromeColor2}\n${monochromeColor3}\n${monochromeColor4}`;
      const blob = new Blob([textContent], { type: 'text/plain' });
      const link = document.createElement('a');
      link.download = 'kleurenpalet.txt';
      link.href = window.URL.createObjectURL(blob);
      link.click();
    });
  
    drawColorWheel();
  });
