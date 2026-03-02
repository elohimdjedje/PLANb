/**
 * Script simple pour générer les icônes PWA (sans dépendances canvas)
 * Utilise sharp si disponible, sinon donne des instructions
 */

const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

function checkSharp() {
  try {
    require.resolve('sharp');
    return true;
  } catch {
    return false;
  }
}

async function generateIconsWithSharp(sourceImagePath) {
  const sharp = require('sharp');
  const iconsDir = path.join(__dirname, '../public/icons');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log(`📷 Génération des icônes à partir de: ${sourceImagePath}`);

  for (const size of ICON_SIZES) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    await sharp(sourceImagePath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(outputPath);

    console.log(`✅ Généré: icon-${size}x${size}.png`);
  }

  console.log('\n🎉 Toutes les icônes ont été générées !');
}

function showInstructions() {
  console.log(`
📱 GÉNÉRATION DES ICÔNES PWA

Option 1: Utiliser un outil en ligne (RECOMMANDÉ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Aller sur: https://www.pwabuilder.com/imageGenerator
2. Uploader votre logo (512x512 ou plus grand)
3. Télécharger toutes les tailles
4. Placer dans: public/icons/

Option 2: Installer sharp et utiliser ce script
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
npm install sharp --save-dev
node scripts/generate-icons-simple.js <chemin-image>

Option 3: Utiliser ImageMagick (si installé)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
for size in 72 96 128 144 152 192 384 512; do
  convert logo.png -resize ${size}x${size} public/icons/icon-${size}x${size}.png
done

Option 4: Créer manuellement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Créer une image 512x512 avec votre logo
2. Redimensionner pour chaque taille:
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
3. Sauvegarder dans: public/icons/

📁 Tailles requises:
${ICON_SIZES.map(s => `   - icon-${s}x${s}.png`).join('\n')}
`);
}

// Main
const sourceImage = process.argv[2];

if (!sourceImage) {
  showInstructions();
  process.exit(0);
}

if (!fs.existsSync(sourceImage)) {
  console.error(`❌ Image source non trouvée: ${sourceImage}`);
  showInstructions();
  process.exit(1);
}

if (checkSharp()) {
  generateIconsWithSharp(sourceImage).catch(error => {
    console.error('❌ Erreur:', error.message);
    showInstructions();
  });
} else {
  console.log('⚠️  Sharp n\'est pas installé');
  console.log('💡 Installation: npm install sharp --save-dev\n');
  showInstructions();
}


