/**
 * Brand-art generator for ALSHAM Forensic AI.
 *
 * Reads image-provider keys from the environment (present on Vercel; usually
 * absent locally → the script skips WITHOUT error, so builds never break).
 * Generates the curated forensic pieces from art-direction.json and writes
 * them to public/brand/ under stable names referenced by the landing hero.
 *
 * Run:  npm run art:generate
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const FAL = process.env.FAL_KEY || process.env.FAL_API_KEY || process.env.FAL_AI_KEY
const IDEO = process.env.IDEOGRAM_API_KEY || process.env.IDEOGRAM_KEY
const OUT = process.env.ART_OUT || 'public/brand'

const cfg = JSON.parse(await fs.readFile(new URL('./art-direction.json', import.meta.url)))

async function viaFal(prompt, aspect) {
  const res = await fetch('https://fal.run/fal-ai/flux-pro/v1.1-ultra', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspect_ratio: aspect, num_images: 1, enable_safety_checker: true }),
  })
  if (!res.ok) throw new Error(`Fal ${res.status}: ${await res.text()}`)
  const j = await res.json()
  return j.images?.[0]?.url
}

async function viaIdeogram(prompt, aspect) {
  const ar = aspect === '1:1' ? 'ASPECT_1_1' : aspect === '3:2' ? 'ASPECT_3_2' : 'ASPECT_16_9'
  const res = await fetch('https://api.ideogram.ai/generate', {
    method: 'POST',
    headers: { 'Api-Key': IDEO, 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_request: { prompt, aspect_ratio: ar, model: 'V_2', magic_prompt_option: 'AUTO', style_type: 'DESIGN' } }),
  })
  if (!res.ok) throw new Error(`Ideogram ${res.status}: ${await res.text()}`)
  const j = await res.json()
  return j.data?.[0]?.url
}

async function run() {
  if (!FAL && !IDEO) {
    console.warn('[art] Sem FAL_KEY/IDEOGRAM_API_KEY — pulando geração (esperado localmente).')
    return
  }
  await fs.mkdir(OUT, { recursive: true })
  for (const p of cfg.pieces) {
    try {
      let url
      if (FAL) { try { url = await viaFal(p.prompt, p.aspect) } catch (e) { console.warn('[art] Fal falhou, tentando Ideogram:', e.message) } }
      if (!url && IDEO) url = await viaIdeogram(p.prompt, p.aspect)
      if (!url) { console.warn(`[art] ${p.name}: nenhuma imagem gerada`); continue }
      const bin = Buffer.from(await (await fetch(url)).arrayBuffer())
      const file = path.join(OUT, `${p.name}.jpg`)
      await fs.writeFile(file, bin)
      console.log(`[art] ${p.name} → ${file} (${(bin.length / 1024).toFixed(0)}kb)`)
    } catch (e) {
      console.error(`[art] ${p.name} erro:`, e.message)
    }
  }
}

run()
