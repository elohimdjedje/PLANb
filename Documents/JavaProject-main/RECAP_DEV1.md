# Récapitulatif Phase 1 - Dev 1 (Terminé)

## Ce qui a été fait :
- Création de la classe abstraite `Chambre` dans `com.gestionhotel.model.Chambre`.
- Implémentation des attributs de base :
  - `numero` (int)
  - `prixParNuit` (double)
  - `occupee` (boolean)
  - `capacite` (int)
- Implémentation des méthodes :
  - Constructeur complet.
  - Getters et Setters.
  - `calculerPrix(int nbNuits)`.
  - `toString()`.
  - Méthode abstraite `getType()` définie.

## Instructions pour Dev 2 (Phase 1 - Suite)
**Tâche :** Implémenter les classes filles `ChambreSimple` et `ChambreDouble`.

### 1. Classe `ChambreSimple`
- **Héritage** : Doit étendre `Chambre`.
- **Constructeur** :
  - Appeler `super(numero, 50, 1)` (Prix de base: 50€, Capacité: 1).
- **Méthode `getType()`** :
  - Retourner "Simple".
- **Attributs** : Aucun supplémentaire.

### 2. Classe `ChambreDouble`
- **Héritage** : Doit étendre `Chambre`.
- **Attributs** :
  - `boolean litsJumeaux` (true si 2 lits simples, false si 1 lit double).
- **Constructeur** :
  - Paramètres : `numero`, `litsJumeaux`.
  - Appeler `super(numero, 80, 2)` (Prix de base: 80€, Capacité: 2).
  - Initialiser `this.litsJumeaux`.
- **Méthode `getType()`** :
  - Retourner "Double".
- **Surcharge `toString()`** :
  - Ajouter l'info sur les lits (Jumeaux ou Lit double).

Bon courage !
