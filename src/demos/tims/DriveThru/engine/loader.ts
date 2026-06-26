import type manifest from '../manifest.json'

type Manifest = typeof manifest

export interface LoadedAssets {
  wheel: HTMLImageElement
  store: HTMLImageElement
  vehicles: Array<{
    id: string
    img: HTMLImageElement
    w: number
    h: number
    wheels: Array<{ x: number; y: number }>
  }>
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

export async function loadAssets(m: Manifest): Promise<LoadedAssets> {
  const [wheelImg, storeImg, ...carImgs] = await Promise.all([
    loadImg(m.wheel.src),
    loadImg(m.store.src),
    ...m.vehicles.map(v => loadImg(v.src)),
  ])

  return {
    wheel: wheelImg,
    store: storeImg,
    vehicles: m.vehicles.map((v, i) => ({
      id: v.id,
      img: carImgs[i],
      w: v.w,
      h: v.h,
      wheels: v.wheels,
    })),
  }
}
