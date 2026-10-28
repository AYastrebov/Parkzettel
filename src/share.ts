import { t } from './i18n'
import { svgToPngBlob } from './sticker'

// Prints two copies of the sticker at 80 mm width on one page. The sheet lives outside #app and is only
// visible in print media (see style.css), so the rest of the page stays out of the printout.
export function printSticker(svg: string) {
  document.getElementById('print-sheet')?.remove()
  const sheet = document.createElement('div')
  sheet.id = 'print-sheet'
  for (let i = 0; i < 2; i++) {
    const copy = document.createElement('div')
    copy.className = 'print-copy'
    copy.innerHTML = svg
    sheet.append(copy)
  }
  const hint = document.createElement('p')
  hint.className = 'print-hint'
  hint.textContent = t('print.hint')
  sheet.append(hint)
  document.body.append(sheet)
  window.addEventListener('afterprint', () => sheet.remove(), { once: true })
  window.print()
}

// The share sheet (save to Photos, AirDrop, send to a print shop) is the natural way to get the sticker
// off a phone. Desktop browsers mostly lack file sharing, so callers hide the button when this is false.
export function canShareFiles(): boolean {
  try {
    return typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([], 'sticker.png', { type: 'image/png' })] })
  } catch {
    return false
  }
}

export async function shareSticker(svg: string, fileName: string) {
  const file = new File([await svgToPngBlob(svg)], fileName, { type: 'image/png' })
  await navigator.share({ files: [file], title: 'Parkzettel' }).catch(() => {}) // cancelled by the user
}
