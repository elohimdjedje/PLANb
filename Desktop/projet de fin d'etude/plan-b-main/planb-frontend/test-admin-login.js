
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const CREDENTIALS = [
    { email: 'admin@planb.ci', password: 'password' },
    { email: 'admin@planb.ci', password: 'admin' },
    { email: 'admin@planb.ci', password: 'password123' },
    { email: 'elohimmickaeldjedje@gmail.com', password: 'test123' },
    { email: 'test@planb.ci', password: 'password123' }
];

function decodeJwt(token) {
    try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
        return JSON.parse(payloadJson);
    } catch (e) {
        return {};
    }
}

async function run() {
    console.log('🔍 Recherche de compte ADMIN...');
    let adminFound = false;

    for (const user of CREDENTIALS) {
        try {
            console.log(`\nTest : ${user.email} / ${user.password}`);
            const response = await axios.post(`${API_URL}/auth/login`, user);

            const token = response.data.data.accessToken;
            const payload = decodeJwt(token);
            const roles = payload.roles || [];

            console.log(`✅ ${user.email} connecté.`);
            console.log(`   Rôles : ${JSON.stringify(roles)}`);

            if (roles.includes('ROLE_ADMIN')) {
                console.log(`🎉 SUCCÈS : Ce compte est ADMINISTRATEUR !`);
                adminFound = true;
                break;
            } else {
                console.log(`❌ Ce compte n'est pas ADMIN.`);
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log(`❌ Identifiants incorrects.`);
            } else {
                console.log(`❌ Erreur connexion : ${error.message}`);
            }
        }
    }

    if (!adminFound) {
        console.log('\n⚠️ AUCUN ADMIN TROUVÉ.');
        console.log('👉 Pour promouvoir votre compte, exécutez ceci dans votre terminal :');
        console.log(`docker exec planb_php php bin/console dbal:run-sql "UPDATE users SET roles = '[\\"ROLE_ADMIN\\"]' WHERE email = 'elohimmickaeldjedje@gmail.com'"`);
    }
}

run();
