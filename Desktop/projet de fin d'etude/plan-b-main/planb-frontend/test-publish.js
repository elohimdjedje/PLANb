import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const API_URL = 'http://localhost:8000/api/v1';
const IMAGE_PATH = '/Users/elohimmickaeldjedje/Downloads/plan-b-main 2/plan-b-main/image/P90462877_highRes_rolls-royce-phantom-.jpg';

// Payload de l'annonce
const LISTING_DATA = {
    title: "Rolls-Royce Phantom 2022 – Luxe et confort premium",
    description: "Magnifique Rolls-Royce Phantom en excellent état, idéale pour mariages, événements VIP, déplacements professionnels ou usage personnel haut de gamme.\nVéhicule très confortable avec intérieur cuir premium, climatisation automatique, système multimédia avancé et conduite extrêmement silencieuse.\n\nDisponible avec ou sans chauffeur. Livraison possible à Abidjan et alentours.\nVéhicule régulièrement entretenu et prêt à l’usage.",
    category: "vehicule",
    subcategory: "Voiture à louer",
    price: 1500000,
    priceUnit: "jour",
    country: "CI",
    city: "Abidjan",
    commune: "Cocody Angré",
    specifications: {
        brand: "Rolls-Royce",
        model: "Phantom",
        year: "2022",
        mileage: "18000",
        fuel: "Essence",
        transmission: "Automatique",
        doors: "4",
        seats: "5",
        color: "Vert métallisé",
        condition: "Excellent état",
        // Highlights (Les +)
        Climatisation: true,
        Bluetooth: true,
        GPS: true,
        "Caméra de recul": true,
        "Assurance incluse": true,
        "Kilométrage illimité": true,
        "Chauffeur disponible": true,
        "Livraison possible": true
    }
};

async function run() {
    console.log('🚀 Démarrage du test de publication...');

    try {
        // 1. Authentification
        console.log('\n🔑 Authentification...');
        let token;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'elohimmickaeldjedje@gmail.com',
                password: 'test123'
            });
            token = loginRes.data.data.accessToken;
            console.log('✅ Authentifié avec succès !');
        } catch (authErr) {
            console.log('⚠️ Échec avec test123, essai avec "password"...');
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'elohimmickaeldjedje@gmail.com',
                password: 'password'
            });
            token = loginRes.data.data.accessToken;
            console.log('✅ Authentifié avec succès !');
        }

        // 2. Upload de l'image
        console.log('\n📤 Upload de l\'image...');
        if (!fs.existsSync(IMAGE_PATH)) {
            throw new Error(`Image introuvable à : ${IMAGE_PATH}`);
        }

        const formData = new FormData();
        formData.append('images[]', fs.createReadStream(IMAGE_PATH));

        const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders() // Headers spécifiques pour multipart/form-data
            }
        });

        // Récupérer l'URL de l'image (structure de réponse peut varier)
        const uploadedInfo = uploadRes.data;
        const imageUrls = uploadedInfo.urls || uploadedInfo.images || [];

        if (imageUrls.length === 0) {
            throw new Error('Aucune URL d\'image retournée par le serveur');
        }

        console.log(`✅ Image uploadée : ${imageUrls[0]}`);

        // 3. Création de l'annonce
        console.log('\n📝 Création de l\'annonce...');

        const finalData = {
            ...LISTING_DATA,
            images: imageUrls
        };

        const createRes = await axios.post(`${API_URL}/listings`, finalData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('\n🎉 ANNONCE PUBLIÉE AVEC SUCCÈS !');
        console.log('-----------------------------------');
        console.log(`ID Annonce : ${createRes.data.data.id}`);
        console.log(`Titre : ${createRes.data.data.title}`);
        console.log(`Statut : ${createRes.data.data.status}`);
        console.log('-----------------------------------');

    } catch (error) {
        console.error('\n❌ ERREUR LORS DU TEST :');
        if (error.response) {
            // Erreur serveur (4xx, 5xx)
            console.error(`Status : ${error.response.status}`);
            console.error('Data :', JSON.stringify(error.response.data, null, 2));
        } else {
            // Erreur réseau ou code
            console.error(error.message);
        }
    }
}

run();
