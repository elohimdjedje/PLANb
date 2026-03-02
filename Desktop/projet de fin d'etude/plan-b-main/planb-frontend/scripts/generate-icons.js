/**
 * Script pour générer les icônes PWA à partir d'une image source
 * Usage: node scripts/generate-icons.js [chemin-image-source]
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Tailles d'icônes requises
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons(sourceImagePath) {
  if (!sourceImagePath) {
    console.error('❌ Erreur: Chemin de l\'image source requis');
    console.log('Usage: node scripts/generate-icons.js <chemin-image>');
    console.log('Exemple: node scripts/generate-icons.js ../plan-b-logo.png');
    process.exit(1);
  }

  // Vérifier que l'image source existe
  if (!fs.existsSync(sourceImagePath)) {
    console.error(`❌ Erreur: Image source non trouvée: ${sourceImagePath}`);
    process.exit(1);
  }

  // Créer le dossier icons s'il n'existe pas
  const iconsDir = path.join(__dirname, '../public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('✅ Dossier icons créé');
  }

  try {
    // Charger l'image source
    console.log(`📷 Chargement de l'image: ${sourceImagePath}`);
    const sourceImage = await loadImage(sourceImagePath);

    // Générer chaque taille
    for (const size of ICON_SIZES) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Fond blanc (ou transparent)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // Calculer les dimensions pour centrer l'image
      const scale = Math.min(size / sourceImage.width, size / sourceImage.height);
      const scaledWidth = sourceImage.width * scale;
      const scaledHeight = sourceImage.height * scale;
      const x = (size - scaledWidth) / 2;
      const y = (size - scaledHeight) / 2;

      // Dessiner l'image centrée
      ctx.drawImage(sourceImage, x, y, scaledWidth, scaledHeight);

      // Sauvegarder
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);

      console.log(`✅ Généré: icon-${size}x${size}.png`);
    }

    console.log('\n🎉 Toutes les icônes ont été générées avec succès !');
    console.log(`📁 Emplacement: ${iconsDir}`);
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    console.log('\n💡 Alternative: Utilisez un outil en ligne comme https://www.pwabuilder.com/imageGenerator');
    process.exit(1);
  }
}

// Exécuter
const sourceImage = process.argv[2];
generateIcons(sourceImage);


