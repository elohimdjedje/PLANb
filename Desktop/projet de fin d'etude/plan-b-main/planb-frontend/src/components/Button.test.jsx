import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Test simple d'un composant Button
describe('Button Component', () => {
  // Composant Button simple pour les tests
  const Button = ({ children, onClick, disabled, variant = 'primary' }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      data-testid="button"
    >
      {children}
    </button>
  )

  it('devrait afficher le texte du bouton', () => {
    render(<Button>Cliquez-moi</Button>)
    expect(screen.getByText('Cliquez-moi')).toBeInTheDocument()
  })

  it('devrait appeler onClick quand cliqué', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Cliquez</Button>)
    
    fireEvent.click(screen.getByTestId('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('ne devrait pas appeler onClick quand désactivé', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick} disabled>Désactivé</Button>)
    
    fireEvent.click(screen.getByTestId('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('devrait avoir la classe variant correcte', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByTestId('button')).toHaveClass('btn-secondary')
  })
})
