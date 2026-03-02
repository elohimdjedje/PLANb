import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Phone, ChevronDown, Search } from 'lucide-react';

// Fonction pour obtenir l'URL du drapeau depuis un service CDN
const getFlagUrl = (countryCode) => {
    // Utiliser flagcdn.com qui est gratuit et fiable
    return `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;
};

// Formatage des numéros par pays (format: [groupes de chiffres])
const PHONE_FORMATS = {
    '+225': { format: [2, 2, 2, 2, 2], placeholder: '07 00 00 00 00' }, // Côte d'Ivoire
    '+221': { format: [3, 2, 2, 2, 2], placeholder: '77 000 00 00' }, // Sénégal
    '+226': { format: [2, 2, 2, 2, 2], placeholder: '70 00 00 00' }, // Burkina Faso
    '+223': { format: [2, 2, 2, 2, 2], placeholder: '70 00 00 00' }, // Mali
    '+227': { format: [2, 2, 2, 2, 2], placeholder: '90 00 00 00' }, // Niger
    '+228': { format: [2, 2, 2, 2, 2], placeholder: '90 00 00 00' }, // Togo
    '+229': { format: [2, 2, 2, 2, 2], placeholder: '90 00 00 00 00' }, // Bénin (10 chiffres)
    '+224': { format: [3, 2, 2, 2, 2], placeholder: '612 00 00 00' }, // Guinée
    '+245': { format: [3, 3, 3], placeholder: '955 123 456' }, // Guinée-Bissau
    '+240': { format: [3, 3, 3], placeholder: '222 123 456' }, // Guinée équatoriale
    '+232': { format: [3, 3, 3], placeholder: '76 123 456' }, // Sierra Leone
    '+231': { format: [4, 3, 3], placeholder: '7700 123 456' }, // Liberia
    '+220': { format: [3, 3, 3], placeholder: '700 1234' }, // Gambie
    '+238': { format: [3, 2, 2], placeholder: '991 12 34' }, // Cap-Vert
    '+234': { format: [3, 3, 4], placeholder: '803 123 4567' }, // Nigeria
    '+233': { format: [3, 3, 4], placeholder: '24 123 4567' }, // Ghana
    '+237': { format: [3, 2, 2, 2, 2], placeholder: '670 00 00 00' }, // Cameroun
    '+236': { format: [2, 2, 2, 2, 2], placeholder: '70 00 00 00' }, // RCA
    '+235': { format: [2, 2, 2, 2, 2], placeholder: '66 00 00 00' }, // Tchad
    '+242': { format: [1, 2, 2, 2, 2], placeholder: '0 61 234 567' }, // Congo
    '+243': { format: [3, 3, 3, 3], placeholder: '999 123 456' }, // RD Congo
    '+257': { format: [2, 2, 2, 2], placeholder: '79 12 34 56' }, // Burundi
    '+250': { format: [3, 3, 3], placeholder: '788 123 456' }, // Rwanda
    '+211': { format: [3, 3, 3], placeholder: '912 123 456' }, // Soudan du Sud
    '+249': { format: [3, 3, 3, 3], placeholder: '912 123 456' }, // Soudan
    '+251': { format: [3, 3, 3, 3], placeholder: '911 123 456' }, // Éthiopie
    '+252': { format: [2, 3, 3, 3], placeholder: '61 234 5678' }, // Somalie
    '+253': { format: [2, 2, 2, 2], placeholder: '77 12 34 56' }, // Djibouti
    '+254': { format: [3, 3, 4], placeholder: '712 123 456' }, // Kenya
    '+255': { format: [3, 3, 4], placeholder: '712 123 456' }, // Tanzanie
    '+256': { format: [3, 3, 3], placeholder: '712 123 456' }, // Ouganda
    '+244': { format: [3, 3, 3], placeholder: '923 123 456' }, // Angola
    '+241': { format: [2, 2, 2, 2], placeholder: '06 12 34 56' }, // Gabon
    '+239': { format: [3, 2, 2], placeholder: '990 12 34' }, // São Tomé
    '+212': { format: [2, 2, 2, 2, 2], placeholder: '06 12 34 56 78' }, // Maroc
    '+213': { format: [3, 2, 2, 2, 2], placeholder: '555 12 34 56' }, // Algérie
    '+216': { format: [2, 3, 3], placeholder: '20 123 456' }, // Tunisie
    '+218': { format: [3, 3, 3], placeholder: '91 234 567' }, // Libye
    '+20': { format: [2, 3, 4, 4], placeholder: '10 1234 5678' }, // Égypte
    '+27': { format: [2, 3, 4], placeholder: '82 123 4567' }, // Afrique du Sud
    '+260': { format: [3, 3, 3], placeholder: '977 123 456' }, // Zambie
    '+263': { format: [2, 3, 4], placeholder: '77 123 4567' }, // Zimbabwe
    '+264': { format: [2, 3, 4], placeholder: '81 123 4567' }, // Namibie
    '+265': { format: [3, 3, 3], placeholder: '991 123 456' }, // Malawi
    '+266': { format: [2, 2, 2, 2], placeholder: '50 12 34 56' }, // Lesotho
    '+268': { format: [2, 2, 2, 2], placeholder: '76 12 34 56' }, // Eswatini
    '+258': { format: [3, 3, 3], placeholder: '82 123 456' }, // Mozambique
    '+267': { format: [2, 3, 3], placeholder: '71 234 567' }, // Botswana
    '+261': { format: [3, 2, 2, 2, 2], placeholder: '032 12 345 67' }, // Madagascar
    '+230': { format: [4, 4], placeholder: '5252 1234' }, // Maurice
    '+248': { format: [2, 2, 2], placeholder: '2 12 34' }, // Seychelles
    '+269': { format: [3, 2, 2], placeholder: '339 12 34' }, // Comores
    '+262': { format: [3, 2, 2, 2, 2], placeholder: '692 12 34 56' }, // La Réunion/Mayotte
    '+290': { format: [4], placeholder: '22158' }, // Sainte-Hélène
    '+33': { format: [1, 2, 2, 2, 2, 2], placeholder: '6 12 34 56 78' }, // France
    '+1': { format: [3, 3, 4], placeholder: '(201) 555-0123' }, // USA/Canada
    '+44': { format: [2, 4, 4], placeholder: '20 1234 5678' }, // UK
    '+32': { format: [3, 2, 2, 2], placeholder: '470 12 34 56' }, // Belgique
    '+41': { format: [2, 3, 2, 2], placeholder: '79 123 45 67' }, // Suisse
    '+49': { format: [3, 3, 4], placeholder: '151 234 5678' }, // Allemagne
    '+34': { format: [3, 3, 3], placeholder: '612 345 678' }, // Espagne
    '+39': { format: [3, 3, 4], placeholder: '312 345 6789' }, // Italie
    '+31': { format: [2, 4, 4], placeholder: '6 1234 5678' }, // Pays-Bas
    '+351': { format: [3, 3, 3], placeholder: '912 345 678' }, // Portugal
    '+7': { format: [3, 3, 2, 2], placeholder: '912 345 67 89' }, // Russie
    '+86': { format: [3, 4, 4], placeholder: '138 1234 5678' }, // Chine
    '+81': { format: [2, 4, 4], placeholder: '90 1234 5678' }, // Japon
    '+82': { format: [2, 4, 4], placeholder: '10 1234 5678' }, // Corée du Sud
    '+91': { format: [2, 5, 5], placeholder: '98 12345 67890' }, // Inde
    '+55': { format: [2, 5, 4], placeholder: '11 91234 5678' }, // Brésil
    '+52': { format: [2, 4, 4], placeholder: '55 1234 5678' }, // Mexique
    '+54': { format: [2, 4, 4], placeholder: '11 1234 5678' }, // Argentine
    '+61': { format: [1, 4, 4], placeholder: '4 1234 5678' }, // Australie
    '+64': { format: [2, 3, 4], placeholder: '21 234 5678' }, // Nouvelle-Zélande
};

// Liste complète de TOUS les pays du monde avec leurs codes téléphoniques et drapeaux
const COUNTRY_CODES_RAW = [
    // Afrique
    { code: '+27', country: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦' },
    { code: '+213', country: 'DZ', name: 'Algérie', flag: '🇩🇿' },
    { code: '+244', country: 'AO', name: 'Angola', flag: '🇦🇴' },
    { code: '+229', country: 'BJ', name: 'Bénin', flag: '🇧🇯' },
    { code: '+267', country: 'BW', name: 'Botswana', flag: '🇧🇼' },
    { code: '+226', country: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: '+257', country: 'BI', name: 'Burundi', flag: '🇧🇮' },
    { code: '+238', country: 'CV', name: 'Cap-Vert', flag: '🇨🇻' },
    { code: '+237', country: 'CM', name: 'Cameroun', flag: '🇨🇲' },
    { code: '+236', country: 'CF', name: 'République centrafricaine', flag: '🇨🇫' },
    { code: '+235', country: 'TD', name: 'Tchad', flag: '🇹🇩' },
    { code: '+269', country: 'KM', name: 'Comores', flag: '🇰🇲' },
    { code: '+242', country: 'CG', name: 'Congo', flag: '🇨🇬' },
    { code: '+243', country: 'CD', name: 'RD Congo', flag: '🇨🇩' },
    { code: '+225', country: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: '+253', country: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
    { code: '+20', country: 'EG', name: 'Égypte', flag: '🇪🇬' },
    { code: '+212', country: 'EH', name: 'Sahara occidental', flag: '🇪🇭' },
    { code: '+251', country: 'ET', name: 'Éthiopie', flag: '🇪🇹' },
    { code: '+268', country: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
    { code: '+241', country: 'GA', name: 'Gabon', flag: '🇬🇦' },
    { code: '+220', country: 'GM', name: 'Gambie', flag: '🇬🇲' },
    { code: '+233', country: 'GH', name: 'Ghana', flag: '🇬🇭' },
    { code: '+224', country: 'GN', name: 'Guinée', flag: '🇬🇳' },
    { code: '+245', country: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼' },
    { code: '+240', country: 'GQ', name: 'Guinée équatoriale', flag: '🇬🇶' },
    { code: '+254', country: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: '+266', country: 'LS', name: 'Lesotho', flag: '🇱🇸' },
    { code: '+231', country: 'LR', name: 'Liberia', flag: '🇱🇷' },
    { code: '+218', country: 'LY', name: 'Libye', flag: '🇱🇾' },
    { code: '+261', country: 'MG', name: 'Madagascar', flag: '🇲🇬' },
    { code: '+265', country: 'MW', name: 'Malawi', flag: '🇲🇼' },
    { code: '+223', country: 'ML', name: 'Mali', flag: '🇲🇱' },
    { code: '+212', country: 'MA', name: 'Maroc', flag: '🇲🇦' },
    { code: '+230', country: 'MU', name: 'Maurice', flag: '🇲🇺' },
    { code: '+262', country: 'YT', name: 'Mayotte', flag: '🇾🇹' },
    { code: '+258', country: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
    { code: '+264', country: 'NA', name: 'Namibie', flag: '🇳🇦' },
    { code: '+227', country: 'NE', name: 'Niger', flag: '🇳🇪' },
    { code: '+234', country: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: '+256', country: 'UG', name: 'Ouganda', flag: '🇺🇬' },
    { code: '+262', country: 'RE', name: 'La Réunion', flag: '🇷🇪' },
    { code: '+250', country: 'RW', name: 'Rwanda', flag: '🇷🇼' },
    { code: '+239', country: 'ST', name: 'São Tomé-et-Príncipe', flag: '🇸🇹' },
    { code: '+221', country: 'SN', name: 'Sénégal', flag: '🇸🇳' },
    { code: '+248', country: 'SC', name: 'Seychelles', flag: '🇸🇨' },
    { code: '+232', country: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
    { code: '+252', country: 'SO', name: 'Somalie', flag: '🇸🇴' },
    { code: '+249', country: 'SD', name: 'Soudan', flag: '🇸🇩' },
    { code: '+211', country: 'SS', name: 'Soudan du Sud', flag: '🇸🇸' },
    { code: '+255', country: 'TZ', name: 'Tanzanie', flag: '🇹🇿' },
    { code: '+228', country: 'TG', name: 'Togo', flag: '🇹🇬' },
    { code: '+216', country: 'TN', name: 'Tunisie', flag: '🇹🇳' },
    { code: '+260', country: 'ZM', name: 'Zambie', flag: '🇿🇲' },
    { code: '+263', country: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
    { code: '+290', country: 'SH', name: 'Sainte-Hélène', flag: '🇸🇭' },
    
    // Amérique du Nord
    { code: '+1', country: 'US', name: 'États-Unis', flag: '🇺🇸' },
    { code: '+1', country: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: '+52', country: 'MX', name: 'Mexique', flag: '🇲🇽' },
    { code: '+501', country: 'BZ', name: 'Belize', flag: '🇧🇿' },
    { code: '+502', country: 'GT', name: 'Guatemala', flag: '🇬🇹' },
    { code: '+503', country: 'SV', name: 'El Salvador', flag: '🇸🇻' },
    { code: '+504', country: 'HN', name: 'Honduras', flag: '🇭🇳' },
    { code: '+505', country: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
    { code: '+506', country: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
    { code: '+507', country: 'PA', name: 'Panama', flag: '🇵🇦' },
    { code: '+1', country: 'CU', name: 'Cuba', flag: '🇨🇺' },
    { code: '+1', country: 'JM', name: 'Jamaïque', flag: '🇯🇲' },
    { code: '+1', country: 'HT', name: 'Haïti', flag: '🇭🇹' },
    { code: '+1', country: 'DO', name: 'République dominicaine', flag: '🇩🇴' },
    { code: '+1', country: 'PR', name: 'Porto Rico', flag: '🇵🇷' },
    { code: '+1', country: 'TT', name: 'Trinité-et-Tobago', flag: '🇹🇹' },
    { code: '+1', country: 'BB', name: 'Barbade', flag: '🇧🇧' },
    
    // Amérique du Sud
    { code: '+54', country: 'AR', name: 'Argentine', flag: '🇦🇷' },
    { code: '+591', country: 'BO', name: 'Bolivie', flag: '🇧🇴' },
    { code: '+55', country: 'BR', name: 'Brésil', flag: '🇧🇷' },
    { code: '+56', country: 'CL', name: 'Chili', flag: '🇨🇱' },
    { code: '+57', country: 'CO', name: 'Colombie', flag: '🇨🇴' },
    { code: '+593', country: 'EC', name: 'Équateur', flag: '🇪🇨' },
    { code: '+592', country: 'GY', name: 'Guyane', flag: '🇬🇾' },
    { code: '+595', country: 'PY', name: 'Paraguay', flag: '🇵🇾' },
    { code: '+51', country: 'PE', name: 'Pérou', flag: '🇵🇪' },
    { code: '+597', country: 'SR', name: 'Suriname', flag: '🇸🇷' },
    { code: '+598', country: 'UY', name: 'Uruguay', flag: '🇺🇾' },
    { code: '+58', country: 'VE', name: 'Venezuela', flag: '🇻🇪' },
    
    // Asie
    { code: '+93', country: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
    { code: '+880', country: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
    { code: '+975', country: 'BT', name: 'Bhoutan', flag: '🇧🇹' },
    { code: '+673', country: 'BN', name: 'Brunei', flag: '🇧🇳' },
    { code: '+855', country: 'KH', name: 'Cambodge', flag: '🇰🇭' },
    { code: '+86', country: 'CN', name: 'Chine', flag: '🇨🇳' },
    { code: '+852', country: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
    { code: '+62', country: 'ID', name: 'Indonésie', flag: '🇮🇩' },
    { code: '+91', country: 'IN', name: 'Inde', flag: '🇮🇳' },
    { code: '+98', country: 'IR', name: 'Iran', flag: '🇮🇷' },
    { code: '+964', country: 'IQ', name: 'Irak', flag: '🇮🇶' },
    { code: '+972', country: 'IL', name: 'Israël', flag: '🇮🇱' },
    { code: '+81', country: 'JP', name: 'Japon', flag: '🇯🇵' },
    { code: '+962', country: 'JO', name: 'Jordanie', flag: '🇯🇴' },
    { code: '+7', country: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
    { code: '+965', country: 'KW', name: 'Koweït', flag: '🇰🇼' },
    { code: '+996', country: 'KG', name: 'Kirghizistan', flag: '🇰🇬' },
    { code: '+856', country: 'LA', name: 'Laos', flag: '🇱🇦' },
    { code: '+961', country: 'LB', name: 'Liban', flag: '🇱🇧' },
    { code: '+60', country: 'MY', name: 'Malaisie', flag: '🇲🇾' },
    { code: '+960', country: 'MV', name: 'Maldives', flag: '🇲🇻' },
    { code: '+976', country: 'MN', name: 'Mongolie', flag: '🇲🇳' },
    { code: '+95', country: 'MM', name: 'Myanmar', flag: '🇲🇲' },
    { code: '+977', country: 'NP', name: 'Népal', flag: '🇳🇵' },
    { code: '+850', country: 'KP', name: 'Corée du Nord', flag: '🇰🇵' },
    { code: '+82', country: 'KR', name: 'Corée du Sud', flag: '🇰🇷' },
    { code: '+968', country: 'OM', name: 'Oman', flag: '🇴🇲' },
    { code: '+92', country: 'PK', name: 'Pakistan', flag: '🇵🇰' },
    { code: '+63', country: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: '+974', country: 'QA', name: 'Qatar', flag: '🇶🇦' },
    { code: '+65', country: 'SG', name: 'Singapour', flag: '🇸🇬' },
    { code: '+94', country: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+886', country: 'TW', name: 'Taïwan', flag: '🇹🇼' },
    { code: '+992', country: 'TJ', name: 'Tadjikistan', flag: '🇹🇯' },
    { code: '+66', country: 'TH', name: 'Thaïlande', flag: '🇹🇭' },
    { code: '+670', country: 'TL', name: 'Timor oriental', flag: '🇹🇱' },
    { code: '+90', country: 'TR', name: 'Turquie', flag: '🇹🇷' },
    { code: '+993', country: 'TM', name: 'Turkménistan', flag: '🇹🇲' },
    { code: '+971', country: 'AE', name: 'Émirats arabes unis', flag: '🇦🇪' },
    { code: '+998', country: 'UZ', name: 'Ouzbékistan', flag: '🇺🇿' },
    { code: '+84', country: 'VN', name: 'Vietnam', flag: '🇻🇳' },
    { code: '+967', country: 'YE', name: 'Yémen', flag: '🇾🇪' },
    
    // Europe
    { code: '+355', country: 'AL', name: 'Albanie', flag: '🇦🇱' },
    { code: '+376', country: 'AD', name: 'Andorre', flag: '🇦🇩' },
    { code: '+374', country: 'AM', name: 'Arménie', flag: '🇦🇲' },
    { code: '+43', country: 'AT', name: 'Autriche', flag: '🇦🇹' },
    { code: '+994', country: 'AZ', name: 'Azerbaïdjan', flag: '🇦🇿' },
    { code: '+375', country: 'BY', name: 'Biélorussie', flag: '🇧🇾' },
    { code: '+32', country: 'BE', name: 'Belgique', flag: '🇧🇪' },
    { code: '+387', country: 'BA', name: 'Bosnie-Herzégovine', flag: '🇧🇦' },
    { code: '+359', country: 'BG', name: 'Bulgarie', flag: '🇧🇬' },
    { code: '+385', country: 'HR', name: 'Croatie', flag: '🇭🇷' },
    { code: '+357', country: 'CY', name: 'Chypre', flag: '🇨🇾' },
    { code: '+420', country: 'CZ', name: 'République tchèque', flag: '🇨🇿' },
    { code: '+45', country: 'DK', name: 'Danemark', flag: '🇩🇰' },
    { code: '+372', country: 'EE', name: 'Estonie', flag: '🇪🇪' },
    { code: '+358', country: 'FI', name: 'Finlande', flag: '🇫🇮' },
    { code: '+33', country: 'FR', name: 'France', flag: '🇫🇷' },
    { code: '+995', country: 'GE', name: 'Géorgie', flag: '🇬🇪' },
    { code: '+49', country: 'DE', name: 'Allemagne', flag: '🇩🇪' },
    { code: '+30', country: 'GR', name: 'Grèce', flag: '🇬🇷' },
    { code: '+36', country: 'HU', name: 'Hongrie', flag: '🇭🇺' },
    { code: '+354', country: 'IS', name: 'Islande', flag: '🇮🇸' },
    { code: '+353', country: 'IE', name: 'Irlande', flag: '🇮🇪' },
    { code: '+39', country: 'IT', name: 'Italie', flag: '🇮🇹' },
    { code: '+371', country: 'LV', name: 'Lettonie', flag: '🇱🇻' },
    { code: '+423', country: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
    { code: '+370', country: 'LT', name: 'Lituanie', flag: '🇱🇹' },
    { code: '+352', country: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
    { code: '+356', country: 'MT', name: 'Malte', flag: '🇲🇹' },
    { code: '+373', country: 'MD', name: 'Moldavie', flag: '🇲🇩' },
    { code: '+377', country: 'MC', name: 'Monaco', flag: '🇲🇨' },
    { code: '+382', country: 'ME', name: 'Monténégro', flag: '🇲🇪' },
    { code: '+31', country: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
    { code: '+389', country: 'MK', name: 'Macédoine du Nord', flag: '🇲🇰' },
    { code: '+47', country: 'NO', name: 'Norvège', flag: '🇳🇴' },
    { code: '+48', country: 'PL', name: 'Pologne', flag: '🇵🇱' },
    { code: '+351', country: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: '+40', country: 'RO', name: 'Roumanie', flag: '🇷🇴' },
    { code: '+7', country: 'RU', name: 'Russie', flag: '🇷🇺' },
    { code: '+378', country: 'SM', name: 'Saint-Marin', flag: '🇸🇲' },
    { code: '+381', country: 'RS', name: 'Serbie', flag: '🇷🇸' },
    { code: '+421', country: 'SK', name: 'Slovaquie', flag: '🇸🇰' },
    { code: '+386', country: 'SI', name: 'Slovénie', flag: '🇸🇮' },
    { code: '+34', country: 'ES', name: 'Espagne', flag: '🇪🇸' },
    { code: '+46', country: 'SE', name: 'Suède', flag: '🇸🇪' },
    { code: '+41', country: 'CH', name: 'Suisse', flag: '🇨🇭' },
    { code: '+380', country: 'UA', name: 'Ukraine', flag: '🇺🇦' },
    { code: '+44', country: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
    { code: '+39', country: 'VA', name: 'Vatican', flag: '🇻🇦' },
    
    // Océanie
    { code: '+61', country: 'AU', name: 'Australie', flag: '🇦🇺' },
    { code: '+679', country: 'FJ', name: 'Fidji', flag: '🇫🇯' },
    { code: '+689', country: 'PF', name: 'Polynésie française', flag: '🇵🇫' },
    { code: '+687', country: 'NC', name: 'Nouvelle-Calédonie', flag: '🇳🇨' },
    { code: '+64', country: 'NZ', name: 'Nouvelle-Zélande', flag: '🇳🇿' },
    { code: '+675', country: 'PG', name: 'Papouasie-Nouvelle-Guinée', flag: '🇵🇬' },
    { code: '+678', country: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
    { code: '+681', country: 'WF', name: 'Wallis-et-Futuna', flag: '🇼🇫' },
    
    // Autres
    { code: '+61', country: 'CX', name: 'Île Christmas', flag: '🇨🇽' },
    { code: '+672', country: 'NF', name: 'Île Norfolk', flag: '🇳🇫' },
];

// Trier par ordre alphabétique du nom (une seule fois au chargement du module)
const COUNTRY_CODES = COUNTRY_CODES_RAW.sort((a, b) => {
    // Normaliser les noms pour le tri (ignorer les accents et majuscules)
    const nameA = a.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const nameB = b.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return nameA.localeCompare(nameB, 'fr');
});

// Fonction pour formater le numéro selon le pays
function formatPhoneNumber(phoneNumber, countryCode) {
    const format = PHONE_FORMATS[countryCode];
    if (!format || !phoneNumber) return phoneNumber;
    
    // Nettoyer le numéro (garder seulement les chiffres)
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Appliquer le formatage
    let formatted = '';
    let index = 0;
    
    for (let i = 0; i < format.format.length && index < cleaned.length; i++) {
        const groupSize = format.format[i];
        const group = cleaned.slice(index, index + groupSize);
        if (group) {
            formatted += (formatted ? ' ' : '') + group;
            index += groupSize;
        }
    }
    
    // Ajouter les chiffres restants
    if (index < cleaned.length) {
        formatted += ' ' + cleaned.slice(index);
    }
    
    return formatted;
}

function PhoneInput({ value = '', onChange, placeholder = '', className = '', required = false }) {
    // Trouver Côte d'Ivoire dans la liste triée pour le pays par défaut (mémorisé)
    const defaultCountry = useMemo(() => 
        COUNTRY_CODES.find(c => c.country === 'CI') || COUNTRY_CODES[0],
        []
    );
    const [selectedCode, setSelectedCode] = useState(defaultCountry);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [displayValue, setDisplayValue] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [flagErrors, setFlagErrors] = useState({});
    const dropdownRef = useRef(null);
    const previousFullNumberRef = useRef('');

    // Référence pour suivre la valeur précédente et éviter les mises à jour inutiles
    const previousValueRef = useRef(value);

    useEffect(() => {
        // Ne mettre à jour que si la valeur a réellement changé
        if (value !== previousValueRef.current) {
            previousValueRef.current = value;
            
            // Extraire le code pays et le numéro depuis la valeur initiale
            if (value) {
                const found = COUNTRY_CODES.find(cc => value.startsWith(cc.code));
                if (found) {
                    setSelectedCode(found);
                    const number = value.replace(found.code, '').trim().replace(/\D/g, '');
                    setPhoneNumber(number);
                    setDisplayValue(formatPhoneNumber(number, found.code));
                } else {
                    setPhoneNumber(value.replace(/\D/g, ''));
                    setDisplayValue(value);
                }
            } else {
                // Si value est vide, réinitialiser
                setPhoneNumber('');
                setDisplayValue('');
            }
        }
    }, [value]);

    // Mémoriser le formatage et la valeur complète
    const formattedValue = useMemo(() => {
        return formatPhoneNumber(phoneNumber, selectedCode.code);
    }, [phoneNumber, selectedCode.code]);

    const fullNumber = useMemo(() => {
        return selectedCode.code + phoneNumber.replace(/\D/g, '');
    }, [selectedCode.code, phoneNumber]);

    // Mettre à jour displayValue et appeler onChange seulement si la valeur a changé
    useEffect(() => {
        setDisplayValue(formattedValue);
        
        // Appeler onChange seulement si la valeur complète a réellement changé
        if (onChange && fullNumber !== previousFullNumberRef.current) {
            previousFullNumberRef.current = fullNumber;
            onChange(fullNumber);
        }
    }, [formattedValue, fullNumber]); // Retirer onChange des dépendances

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                setSearchTerm('');
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleCodeSelect = useCallback((code) => {
        setSelectedCode(code);
        setIsDropdownOpen(false);
        setSearchTerm('');
    }, []);

    const handlePhoneChange = useCallback((e) => {
        const input = e.target.value.replace(/\D/g, ''); // Garder seulement les chiffres
        setPhoneNumber(input);
        const formatted = formatPhoneNumber(input, selectedCode.code);
        setDisplayValue(formatted);
    }, [selectedCode.code]);

    // Mémoriser le filtrage des pays pour éviter de recalculer à chaque rendu
    const filteredCountries = useMemo(() => {
        if (!searchTerm) return COUNTRY_CODES;
        
        const term = searchTerm.toLowerCase();
        return COUNTRY_CODES.filter((country) => 
            country.name.toLowerCase().includes(term) ||
            country.code.includes(term) ||
            country.country.toLowerCase().includes(term)
        );
    }, [searchTerm]);

    const currentPlaceholder = PHONE_FORMATS[selectedCode.code]?.placeholder || placeholder || "00 00 00 00 00";

    return (
        <div className={`relative ${className}`}>
            <div className="flex shadow-sm rounded-xl overflow-visible border border-gray-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                {/* Code pays selector */}
                <div className="relative z-10" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border-r border-gray-200 transition-all duration-200 rounded-l-xl ${
                            isDropdownOpen ? 'bg-gray-100' : ''
                        }`}
                    >
                        {flagErrors[selectedCode.country] ? (
                            <span className="text-xl leading-none flex-shrink-0" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>
                                {selectedCode.flag}
                            </span>
                        ) : (
                            <img 
                                src={getFlagUrl(selectedCode.country)}
                                alt={selectedCode.name}
                                className="w-6 h-4 object-cover rounded shadow-sm flex-shrink-0"
                                onError={() => {
                                    setFlagErrors(prev => ({ ...prev, [selectedCode.country]: true }));
                                }}
                            />
                        )}
                        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{selectedCode.code}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] w-80 overflow-hidden phone-dropdown-animate">
                            {/* Recherche */}
                            <div className="sticky top-0 bg-white border-b border-gray-100 p-3 shadow-sm">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Rechercher un pays..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50 focus:bg-white"
                                        autoFocus
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                                {searchTerm && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {filteredCountries.length} résultat{filteredCountries.length > 1 ? 's' : ''} trouvé{filteredCountries.length > 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                            
                            {/* Liste des pays */}
                            <div className="max-h-96 overflow-y-auto phone-input-dropdown">
                                {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country) => (
                                        <button
                                            key={`${country.code}-${country.country}`}
                                            type="button"
                                            onClick={() => handleCodeSelect(country)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-left transition-colors duration-150 border-b border-gray-50 last:border-b-0 ${
                                                selectedCode.code === country.code && selectedCode.country === country.country 
                                                    ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                                            }`}
                                        >
                                            {flagErrors[country.country] ? (
                                                <span className="text-xl leading-none flex-shrink-0" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>
                                                    {country.flag}
                                                </span>
                                            ) : (
                                                <img 
                                                    src={getFlagUrl(country.country)}
                                                    alt={country.name}
                                                    className="w-7 h-5 object-cover rounded shadow-sm flex-shrink-0"
                                                    onError={() => {
                                                        setFlagErrors(prev => ({ ...prev, [country.country]: true }));
                                                    }}
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{country.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{country.code}</div>
                                            </div>
                                            {selectedCode.code === country.code && selectedCode.country === country.country && (
                                                <span className="text-orange-500 flex-shrink-0 text-lg">✓</span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-12 text-center">
                                        <div className="text-gray-400 mb-2">
                                            <Search className="w-8 h-8 mx-auto opacity-50" />
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Aucun pays trouvé</p>
                                        <p className="text-gray-400 text-xs mt-1">Essayez une autre recherche</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Numéro de téléphone */}
                <div className="flex-1 relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                    <input
                        type="tel"
                        value={displayValue}
                        onChange={handlePhoneChange}
                        placeholder={currentPlaceholder}
                        required={required}
                        className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none transition-all text-sm"
                    />
                </div>
            </div>
        </div>
    );
}

export default PhoneInput;
