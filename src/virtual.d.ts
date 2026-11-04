// The landing hero's QR code, rendered at build time by vite.config.ts. It always points at the production
// site root, and `domain` is the host printed under it.
declare module 'virtual:hero-qr' {
  const svg: string
  export default svg
  export const domain: string
}
