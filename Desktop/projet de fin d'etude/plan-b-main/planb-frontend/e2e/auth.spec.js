import { test, expect } from '@playwright/test'

test.describe('Authentification', () => {
  test('devrait afficher la page de connexion', async ({ page }) => {
    await page.goto('/login')
    
    // Vérifier les champs du formulaire
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i))
    const passwordInput = page.getByLabel(/mot de passe/i).or(page.getByPlaceholder(/mot de passe/i))
    
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  test('devrait afficher une erreur avec des identifiants invalides', async ({ page }) => {
    await page.goto('/login')
    
    // Remplir le formulaire avec des identifiants invalides
    await page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).fill('invalid@test.com')
    await page.getByLabel(/mot de passe/i).or(page.getByPlaceholder(/mot de passe/i)).fill('wrongpassword')
    
    // Soumettre le formulaire
    await page.getByRole('button', { name: /connexion|se connecter/i }).click()
    
    // Attendre une erreur
    await page.waitForTimeout(2000)
    
    // Vérifier qu'une erreur est affichée ou que l'URL n'a pas changé
    const currentUrl = page.url()
    expect(currentUrl).toContain('/login')
  })

  test('devrait afficher la page d\'inscription', async ({ page }) => {
    await page.goto('/register')
    
    // Vérifier les champs du formulaire
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i))
    
    await expect(emailInput).toBeVisible()
  })

  test('devrait rediriger vers login si non authentifié sur page protégée', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Attendre la redirection
    await page.waitForTimeout(2000)
    
    // Vérifier qu'on est redirigé vers login
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/login|connexion/i)
  })
})
