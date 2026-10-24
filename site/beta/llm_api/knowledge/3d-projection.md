# Pseudo-3D projection

Store objects and paths in one shared world coordinate system (x,y,z). Rotate world points relative to a camera, then apply perspective and viewport centering. Project both endpoints of line segments, orbit samples, planet positions and markers through **the same** function.

Do not draw orbital ellipses directly in screen coordinates if they are meant to tilt with camera orbit. Generate samples in the orbital plane in 3D, project samples individually and join them. Place labels and HUD intentionally in either world space or screen space. A working reference is `theatre/sol-local-stellar-neighbourhood.js` from the ghostly favourites branch, if merged or available.
