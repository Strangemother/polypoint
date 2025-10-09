/**
 * signedNorm(p, c, R, phi = 0, period = 0)
 *
 * Project the vector from circle center `c` to point `p` onto a chosen axis,
 * then normalize by the circle radius `R`, and clamp to [-1, 1].
 *
 * Geometric meaning:
 *   s = -1  … the point sits one radius "behind" the center along the axis
 *   s =  0  … the point is exactly on the axis’ origin (the center)
 *   s = +1  … the point sits one radius "ahead" of the center along the axis
 * Values outside the circle are clamped to the ends.
 *
 * Math:
 *   u = [cos(phi), sin(phi)]                          // unit axis at angle phi
 *   v = [p.x - c.x, p.y - c.y]                        // vector from center to p
 *   s_raw = (v · u) / R                               // signed distance in radii
 *   s = clamp(s_raw, -1, 1)
 *
 * Params:
 *   p:      {x, y}  point to measure
 *   c:      {x, y}  circle center
 *   R:      number  circle radius (must be > 0)
 *   phi:    number  axis angle in radians (0 = +X, π/2 = +Y)
 *   period: number  OPTIONAL phase/offset for the axis angle (see note)
 *
 * Return:
 *   number in [-1, 1] — normalized signed position of p along the axis.
 *
 * Notes:
 *   • If you want a time-varying axis, use `phi + phase` (or `phi + ω*t`).
 *     Adding `period` directly to sin() (as in the original) breaks unit length.
 *   • R must be positive; R = 0 will blow up.
 */
function signedNorm(p, c, R, phi = 0, period = 0) {
  if (R <= 0) return 0; // or throw, if you prefer
  // Treat `period` as a phase/offset of the axis angle:
  const a  = phi + period;
  const ux = Math.cos(a), uy = Math.sin(a);    // unit axis
  const dx = p.x - c.x,  dy = p.y - c.y;
  const s  = (dx * ux + dy * uy) / R;          // projection in radii
  return Math.max(-1, Math.min(1, s));
}
