# JavaProject le repo des boss

# Projet Java -- Système de Gestion d'Hôtel

Ce projet consiste à développer une application Java de gestion complète
d'un hôtel avec gestion des chambres, des clients, des réservations, des
services ainsi que des statistiques.

------------------------------------------------------------------------
## 📁 Structure du projet

```text
src/
├── main/
│   └── java/
│       └── com/
│           └── gestionhotel/
│               ├── model/
│               │   ├── Chambre.java
│               │   ├── ChambreSimple.java
│               │   ├── ChambreDouble.java
│               │   ├── Suite.java
│               │   ├── Client.java
│               │   ├── Service.java
│               │   └── Reservation.java
│               ├── core/
│               │   ├── Hotel.java
│               │   └── Statistiques.java
│               ├── utils/
│               │   ├── DateUtils.java
│               │   ├── ValidationUtils.java
│               │   └── FilePersistence.java
│               └── ui/
│                   └── MenuPrincipal.java
├── test/
│   └── com/
│       └── gestionhotel/
│           └── test/
└── resources/
    ├── hotel.properties
    └── services_init.txt
```
------------------------------------------------------------------------

## Phases du Projet

### Phase 1 : Classes de base

-   Gestion des chambres, clients et services

### Phase 2 : Réservations

-   Création, calculs, annulation

### Phase 3 : Classe Hotel

-   Gestion globale et statistiques

### Phase 4 : Menu interactif

-   Interface console complète

------------------------------------------------------------------------

## Fonctionnalités

-   Gestion chambres, clients, réservations
-   Ajout services
-   Statistiques
-   Sauvegarde fichiers
-   Menu interactif

------------------------------------------------------------------------

## Répartition du Travail

Projet réalisé en équipe avec répartition.
| Phase                 | Dev 1  - Code                | Dev 2 - Code                | Dev 3 - Code                     | Dev 4 - Code                  | Tests Croisés (TOUS)                                          |
| --------------------- | ---------------------------------- | --------------------------- | -------------------------------- | ----------------------------- | ------------------------------------------------------------- |
| Phase 1: Model        | Chambreabstraite + interfaces      | ChambreSimple/Double        | Suite + Client(email validation) | Service + DateUtils           | D1 teste D2, D2 teste D3, D3 teste D4, D4 teste D1            |
| Phase 2: Réservations | Reservation(prix/nuits/services)   | Intégration Client/Chambre  | Statut + annulation              | ValidationUtils + Exceptions  | Rotation : D1 teste D3, D2 teste D4, D3 teste D1, D4 teste D2 |
| Phase 3: Hotel Core   | Gestion chambres (recherche/dispo) | Gestion clients             | Réservations (créer/afficher)    | Statistiques +FilePersistence | Tous testent Hotel ensemble (intégration)                     |
| Phase 4: UI + Bonus   | MenuPrincipal + chambres/clients   | Menus réservations/services | Stats + try-catch global         | Bonus fidélité + Swing        | Cross-tests UI + démo collective                              |

------------------------------------------------------------------------
