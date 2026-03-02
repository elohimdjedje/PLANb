/**
 * Script pour générer des icônes PWA immédiatement
 * Crée des icônes placeholder avec le logo Plan B ou un design simple
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Fonction pour créer un SVG avec le logo Plan B
function createSVGIcon(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond orange -->
  <rect width="${size}" height="${size}" fill="#F97316" rx="${size * 0.1}"/>
  
  <!-- Texte Plan B -->
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${size * 0.25}" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="middle"
  >Plan B</text>
  
  <!-- Icône maison (optionnel) -->
  <g transform="translate(${size * 0.5}, ${size * 0.35})">
    <path 
      d="M ${-size * 0.15} ${size * 0.1} L 0 ${-size * 0.1} L ${size * 0.15} ${size * 0.1} Z" 
      fill="white" 
      opacity="0.3"
    />
    <rect 
      x="${-size * 0.12}" 
      y="${size * 0.1}" 
      width="${size * 0.24}" 
      height="${size * 0.12}" 
      fill="white" 
      opacity="0.3"
    />
  </g>
</svg>`;
}

// Fonction pour convertir SVG en PNG (nécessite sharp ou une alternative)
async function generatePNGFromSVG(svgContent, size, outputPath) {
  // Si sharp est disponible, l'utiliser
  try {
    const sharp = (await import('sharp')).default;
    const buffer = Buffer.from(svgContent);
    await sharp(buffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    return true;
  } catch (error) {
    // Si sharp n'est pas disponible, créer un SVG temporaire
    // L'utilisateur pourra le convertir plus tard
    fs.writeFileSync(outputPath.replace('.png', '.svg'), svgContent);
    return false;
  }
}

// Fonction principale
async function generateIcons() {
  const iconsDir = path.join(__dirname, '../public/icons');
  
  // Créer le dossier s'il n'existe pas
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('✅ Dossier icons créé');
  }

  // Vérifier si sharp est disponible
  let hasSharp = false;
  try {
    await import('sharp');
    hasSharp = true;
    console.log('✅ Sharp détecté - Génération PNG...\n');
  } catch {
    console.log('⚠️  Sharp non disponible - Génération SVG...\n');
    console.log('💡 Pour PNG: npm install sharp --save-dev\n');
  }

  let successCount = 0;
  let svgCount = 0;

  for (const size of ICON_SIZES) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    const svgContent = createSVGIcon(size);

    if (hasSharp) {
      try {
        await generatePNGFromSVG(svgContent, size, outputPath);
        console.log(`✅ Généré: icon-${size}x${size}.png`);
        successCount++;
      } catch (error) {
        console.error(`❌ Erreur pour ${size}x${size}:`, error.message);
        // Créer SVG en fallback
        const svgPath = outputPath.replace('.png', '.svg');
        fs.writeFileSync(svgPath, svgContent);
        console.log(`   → SVG créé: icon-${size}x${size}.svg`);
        svgCount++;
      }
    } else {
      // Créer SVG directement
      const svgPath = outputPath.replace('.png', '.svg');
      fs.writeFileSync(svgPath, svgContent);
      console.log(`✅ Généré: icon-${size}x${size}.svg`);
      svgCount++;
    }
  }

  console.log('\n📊 Résumé:');
  if (successCount > 0) {
    console.log(`   ✅ ${successCount} icônes PNG créées`);
  }
  if (svgCount > 0) {
    console.log(`   📄 ${svgCount} icônes SVG créées`);
    console.log('\n💡 Pour convertir SVG en PNG:');
    console.log('   1. Installer sharp: npm install sharp --save-dev');
    console.log('   2. Utiliser un outil en ligne: https://cloudconvert.com/svg-to-png');
    console.log('   3. Ou utiliser ImageMagick: convert icon-*.svg icon-*.png');
  }

  console.log(`\n📁 Emplacement: ${iconsDir}`);
  console.log('\n🎉 Icônes générées !');
  
  if (svgCount > 0) {
    console.log('\n⚠️  Note: Le manifest.json attend des fichiers PNG.');
    console.log('   Les SVG sont des placeholders. Convertissez-les en PNG pour la production.');
  }
}

// Exécuter
generateIcons().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});

