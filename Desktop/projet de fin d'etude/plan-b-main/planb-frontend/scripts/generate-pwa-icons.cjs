const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/icons/iconefinal.png');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  console.log('🎨 Génération des icônes PWA à partir de iconefinal.png...\n');
  
  if (!fs.existsSync(inputFile)) {
    console.error('❌ Fichier source non trouvé:', inputFile);
    process.exit(1);
  }

  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 26, g: 32, b: 44, alpha: 1 } // Couleur de fond bleu foncé
        })
        .png()
        .toFile(outputFile);
      
      console.log(`✅ icon-${size}x${size}.png généré`);
    } catch (error) {
      console.error(`❌ Erreur pour ${size}x${size}:`, error.message);
    }
  }

  console.log('\n🎉 Génération terminée !');
  console.log('📱 Les icônes sont prêtes pour la PWA.');
}

generateIcons();
