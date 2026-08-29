import sharp from 'sharp'
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const sourceDir = path.join(root, 'public', 'sheets')
const outDir = path.join(root, 'public', 'products')
await mkdir(outDir, { recursive: true })
const sheets = (await readdir(sourceDir)).filter((file) => file.endsWith('.png')).sort()
if (sheets.length !== 5) throw new Error(`Expected 5 source sheets, found ${sheets.length}`)
let n = 1
for (const sheet of sheets) {
  const image = sharp(path.join(sourceDir, sheet))
  const meta = await image.metadata()
  const cellW = Math.floor(meta.width / 5)
  const cellH = Math.floor(meta.height / 2)
  for (let row = 0; row < 2; row++) for (let col = 0; col < 5; col++) {
    await image.clone().extract({ left: col * cellW, top: row * cellH, width: cellW, height: cellH }).resize(720, 720, { fit: 'cover' }).webp({ quality: 88 }).toFile(path.join(outDir, `product-${String(n).padStart(2, '0')}.webp`))
    n++
  }
}
console.log(`Generated ${n - 1} unique WebP product images.`)
