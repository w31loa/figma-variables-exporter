export function unboundRGBA(r: number, g: number, b: number, a: number = 1): RGBA {
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: Math.round(a * 100) / 100
  }
}

export function rgbaToHex(value: RGBA) {
  return '#' + (
    value.r.toString(16).padStart(2, '0') + 
    value.g.toString(16).padStart(2, '0') + 
    value.b.toString(16).padStart(2, '0') + 
    Math.round(value.a * 255).toString(16).padStart(2, '0')
  ).toUpperCase()
}