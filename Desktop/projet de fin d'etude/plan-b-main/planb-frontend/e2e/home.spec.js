import { test, expect } from '@playwright/test'

test.describe('Page d\'accueil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('devrait afficher le titre Plan B', async ({ page }) => {
    await expect(page).toHaveTitle(/Plan B/i)
  })

  test('devrait afficher le header avec logo', async ({ page }) => {
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('devrait afficher les boutons de connexion/inscription', async ({ page }) => {
    // Chercher les liens de connexion
    const loginLink = page.getByRole('link', { name: /connexion/i })
    const registerLink = page.getByRole('link', { name: /inscription/i })
    
    // Au moins un des deux devrait être visible
    const loginVisible = await loginLink.isVisible().catch(() => false)
    const registerVisible = await registerLink.isVisible().catch(() => false)
    
    expect(loginVisible || registerVisible).toBeTruthy()
  })

  test('devrait avoir un champ de recherche', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/recherch/i)
    await expect(searchInput).toBeVisible()
  })

  test('devrait afficher les annonces', async ({ page }) => {
    // Attendre le chargement des annonces
    await page.waitForTimeout(2000)
    
    // Vérifier qu'il y a des cartes d'annonces ou un message "aucune annonce"
    const listings = page.locator('[data-testid="listing-card"]')
    const noListings = page.getByText(/aucune annonce/i)
    
    const hasListings = await listings.count() > 0
    const hasNoListingsMessage = await noListings.isVisible().catch(() => false)
    
    expect(hasListings || hasNoListingsMessage).toBeTruthy()
  })
})
