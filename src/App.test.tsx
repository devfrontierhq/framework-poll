import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  it('renders the Tailwind and shadcn smoke-test content', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Framework Poll is rendering with Tailwind CSS.',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Primary Action',
      }),
    ).toBeInTheDocument()
  })
})
