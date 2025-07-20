import { createCanvas, loadImage, registerFont } from 'canvas';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  registerFont(path.join(__dirname, 'fonts/Roboto-Regular.ttf'), { family: 'Roboto', weight: 'normal' });
} catch (error) {}

class CertificateService {
  constructor() {
    this.certificateWidth = 1400;
    this.certificateHeight = 1000;
    this.outputDir = path.join(__dirname, '../uploads/certificates');
    this.squareCertificateSize = 2160;
    this.colors = {
      primary: '#8b1c2c', // Deep red
      text: '#222222',
      background: '#FFFFFF',
      border: '#BFA14A', // Dark gold
      gray: '#888888',
      sloganBar: '#8B1C2C',
      ctaBar: '#8B1C2C',
      white: '#FFFFFF',
      badgeBorder: '#fed000', // Gold for blood group badge border
      badgeBg: '#8b1c2c',     // Deep red for blood group badge background
      badgeText: '#FFFFFF',   // Crystal white for blood type text
    };
    this.fontFamily = 'Roboto, Arial, sans-serif';
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateCertificate(donorData, donationData) {
    try {
      const canvas = createCanvas(this.certificateWidth, this.certificateHeight);
      const ctx = canvas.getContext('2d');
      this.drawBackground(ctx, this.certificateWidth, this.certificateHeight);
      await this.drawHeader(ctx);
      await this.drawMainSection(ctx, donorData, donationData);
      await this.drawCallToActionBar(ctx, donorData);
      await this.drawFooter(ctx);
      const filename = `certificate-${donorData.id}-${Date.now()}.png`;
      const filepath = path.join(this.outputDir, filename);
      const buffer = canvas.toBuffer('image/png', { quality: 1.0, compressionLevel: 0 });
      fs.writeFileSync(filepath, buffer);
      return {
        filename,
        filepath,
        url: `/uploads/certificates/${filename}`
      };
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }

  drawBackground(ctx, width, height) {
    ctx.fillStyle = this.colors.background;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = this.colors.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);
  }

  async drawHeader(ctx) {
    // Logo top left (not full width)
    const logoPath = path.join(__dirname, '../../public/logo.png');
    const logoSize = 120;
    const logoX = 60;
    const logoY = 40;
    if (fs.existsSync(logoPath)) {
      try {
        const logo = await loadImage(logoPath);
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      } catch (e) {}
    }
    // Slogan bar top right
    const sloganBarWidth = 340;
    const sloganBarHeight = 48;
    const sloganBarX = 1040;
    const sloganBarY = 40;
    ctx.fillStyle = this.colors.sloganBar;
    ctx.fillRect(sloganBarX, sloganBarY, sloganBarWidth, sloganBarHeight);
    ctx.font = `bold 26px ${this.fontFamily}`;
    ctx.fillStyle = this.colors.white;
    ctx.textAlign = 'center';
    ctx.fillText('WE SHARE WE CARE', sloganBarX + sloganBarWidth / 2, sloganBarY + 33);
    // Blood group badge below slogan bar (reference style, now shield shape)
    const badgeY = sloganBarY + sloganBarHeight + 38;
    const badgeX = sloganBarX + sloganBarWidth / 2;
    const badgeWidth = 110;
    const badgeHeight = 135;
    let bloodType = this._currentBloodType;
    if (!bloodType || typeof bloodType !== 'string') bloodType = 'B+';
    // Draw shield badge with thick gold border, deep red bg, no shadow
    ctx.save();
    ctx.beginPath();
    // Shield path
    ctx.moveTo(badgeX, badgeY);
    ctx.lineTo(badgeX - badgeWidth / 2, badgeY + badgeHeight * 0.32);
    ctx.quadraticCurveTo(
      badgeX - badgeWidth / 2, badgeY + badgeHeight * 0.85,
      badgeX, badgeY + badgeHeight
    );
    ctx.quadraticCurveTo(
      badgeX + badgeWidth / 2, badgeY + badgeHeight * 0.85,
      badgeX + badgeWidth / 2, badgeY + badgeHeight * 0.32
    );
    ctx.lineTo(badgeX, badgeY);
    ctx.closePath();
    ctx.fillStyle = this.colors.badgeBg;
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = this.colors.badgeBorder;
    ctx.stroke();
    ctx.restore();
    // Draw only blood group text (centered in shield, no droplet)
    ctx.save();
    ctx.font = `bold 38px ${this.fontFamily}`;
    ctx.fillStyle = this.colors.badgeText;
    ctx.textAlign = 'center';
    ctx.fillText(bloodType, badgeX, badgeY + badgeHeight * 0.62);
    ctx.restore();
  }

  async drawMainSection(ctx, donorData, donationData) {
    // Title
    ctx.font = `bold 38px ${this.fontFamily}`;
    ctx.fillStyle = this.colors.primary;
    ctx.textAlign = 'center';
    ctx.fillText('HONORING OUR LIFESAVERS', this.certificateWidth / 2, 180);
    // Donor photo
    await this.drawDonorPhoto(ctx, donorData);
    // Add extra gap before donor name
    const donorName = donorData.full_name || donorData.fullName || 'Honored Donor';
    const bloodType = donorData.blood_type || donorData.bloodGroup || 'B+';
    this._currentBloodType = bloodType; // For badge in header
    const nameY = 220 + 220 + 80; // photoY + photoSize + larger margin
    ctx.font = `bold 36px ${this.fontFamily}`;
    ctx.fillStyle = this.colors.text;
    ctx.textAlign = 'center';
    ctx.fillText(donorName, this.certificateWidth / 2, nameY);
    // Blood group in italic just below donor name (still, for clarity)
    ctx.font = `italic 28px ${this.fontFamily}`;
    ctx.fillStyle = this.colors.primary;
    ctx.fillText(bloodType, this.certificateWidth / 2, nameY + 36);
    // Main message
    const messageY = nameY + 80;
    ctx.font = `22px ${this.fontFamily}`;
    ctx.fillStyle = this.colors.text;
    ctx.textAlign = 'center';
    const part1 = 'A special shout-out to our extraordinary blood donor.';
    const part2 = 'Your selfless donation has made a positive impact and become a lifeline for those in need.';
    ctx.fillText(part1, this.certificateWidth / 2, messageY);
    ctx.fillText(part2, this.certificateWidth / 2, messageY + 32);
    // Thank you
    ctx.font = `bold 22px ${this.fontFamily}`;
    ctx.fillStyle = this.colors.primary;
    ctx.fillText('Thank you.', this.certificateWidth / 2, messageY + 70);
  }

  async drawDonorPhoto(ctx, donorData) {
    const photoY = 220;
    const photoSize = 220;
    const centerX = this.certificateWidth / 2;
    let imagePath;
    if (donorData.profilePhoto && donorData.profilePhoto.startsWith('/uploads/')) {
      imagePath = path.join(__dirname, '..', donorData.profilePhoto);
    } else if (donorData.profilePhoto) {
      imagePath = path.join(__dirname, '../uploads', donorData.profilePhoto);
    }
    // Draw border
    ctx.save();
    ctx.strokeStyle = this.colors.primary;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, photoY + photoSize / 2, photoSize / 2 + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // Draw photo or placeholder
    if (imagePath && fs.existsSync(imagePath)) {
      const photo = await loadImage(imagePath);
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(photo, centerX - photoSize / 2, photoY, photoSize, photoSize);
      ctx.restore();
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = this.colors.gray;
      ctx.fillRect(centerX - photoSize / 2, photoY, photoSize, photoSize);
      ctx.font = `bold 80px ${this.fontFamily}`;
      ctx.fillStyle = this.colors.white;
      ctx.textAlign = 'center';
      ctx.fillText('👤', centerX, photoY + photoSize / 2 + 30);
      ctx.restore();
    }
  }

  async drawCallToActionBar(ctx, donorData) {
    const barY = 690;
    const barHeight = 130;
    ctx.fillStyle = this.colors.ctaBar;
    ctx.fillRect(0, barY, this.certificateWidth, barHeight);
    // Call to action text with white rounded background
    const textBgX = 50;
    const textBgY = barY + 18;
    const textBgWidth = this.certificateWidth - 300;
    const textBgHeight = 90;
    ctx.save();
    ctx.fillStyle = this.colors.white;
    ctx.beginPath();
    ctx.moveTo(textBgX + 20, textBgY);
    ctx.arcTo(textBgX + textBgWidth, textBgY, textBgX + textBgWidth, textBgY + textBgHeight, 24);
    ctx.arcTo(textBgX + textBgWidth, textBgY + textBgHeight, textBgX, textBgY + textBgHeight, 24);
    ctx.arcTo(textBgX, textBgY + textBgHeight, textBgX, textBgY, 24);
    ctx.arcTo(textBgX, textBgY, textBgX + textBgWidth, textBgY, 24);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.font = `bold 28px ${this.fontFamily}`;
    ctx.fillStyle = this.colors.ctaBar;
    ctx.textAlign = 'left';
    ctx.fillText(
      "Ready to follow their footsteps? If you haven't donated yet, find a donation center near you OR",
      textBgX + 30,
      textBgY + 38
    );
    ctx.font = `bold 26px ${this.fontFamily}`;
    ctx.fillText('You can Scan QR to register your details.', textBgX + 30, textBgY + 78);
    // QR code on right (larger)
    const qrSize = 120;
    const qrX = this.certificateWidth - qrSize - 80;
    const qrY = barY + (barHeight - qrSize) / 2;
    const qrText = 'https://bloodfornepal.org/register';
    const qrCodeDataURL = await QRCode.toDataURL(qrText, {
      width: qrSize,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    const qrImage = await loadImage(qrCodeDataURL);
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
    // Border for QR
    ctx.strokeStyle = this.colors.white;
    ctx.lineWidth = 4;
    ctx.strokeRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12);
  }

  async drawFooter(ctx) {
    const footerY = this.certificateHeight - 70;
    // Donate blood save life
    ctx.font = `bold 32px ${this.fontFamily}`;
    ctx.fillStyle = this.colors.primary;
    ctx.textAlign = 'center';
    ctx.fillText('DONATE BLOOD SAVE LIFE', this.certificateWidth / 2, footerY - 30);
    // Footer info in a single line, spaced evenly, with icons
    ctx.font = `20px ${this.fontFamily}`;
    ctx.fillStyle = this.colors.text;
    ctx.textAlign = 'center';
    const info = [
      { icon: '✉️', text: 'info@bloodfornepal.org' },
      { icon: '🌐', text: 'bloodfornepal.org' },
      { icon: '📞', text: '9825733821' }
    ];
    const sectionWidth = this.certificateWidth / 3;
    ctx.textAlign = 'center';
    ctx.fillText(`${info[0].icon}  ${info[0].text}`, sectionWidth * 0.5, footerY + 10);
    ctx.fillText(`${info[1].icon}  ${info[1].text}`, sectionWidth * 1.5, footerY + 10);
    ctx.fillText(`${info[2].icon}  ${info[2].text}`, sectionWidth * 2.5, footerY + 10);
  }
}

export default new CertificateService();
