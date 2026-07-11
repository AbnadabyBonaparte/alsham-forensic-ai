'use client'

/**
 * Focal art layer for the cinematic hero.
 * References a public path (string) — never an import — so a missing
 * asset 404s silently and the CSS mesh/glow/grain beneath carry the scene.
 * When /brand/hero.jpg exists (generated via `npm run art:generate` on
 * Vercel), it blends in on top of the gradient base.
 */
export function HeroArt() {
  return (
    <img
      src="/brand/hero.jpg"
      alt=""
      aria-hidden
      draggable={false}
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
      className="hero-focal"
    />
  )
}
