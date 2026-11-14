# Connecting Ridge terrain skyline

The Landing site view compares JPL Horizons azimuth and elevation with a skyline
derived from NASA Goddard's [5 m/pixel Site01 elevation grid](https://pgda.gsfc.nasa.gov/products/78).
Download [Site01_final_adj_5mpp_surf.tif](https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site01/Site01_final_adj_5mpp_surf.tif)
and run the generator with Python 3.11+, NumPy, and Pillow.

```text
python generate_terrain_profile.py Site01_final_adj_5mpp_surf.tif
```

The generator uses the HELIOS Connecting Ridge coordinates (89.45° S, 137° W) in
the DE421 lunar mean Earth frame. It places the observer 2 m above the
interpolated surface and takes the highest terrain angle along each bearing
out to 7 km, accounting for lunar curvature. The JSON records the source raster
checksum and model parameters. The app interpolates the skyline at the
JPL azimuth and subtracts it from the apparent elevation of the body center.

These estimates apply at those coordinates and assume the observer height above.
The calculation covers the local grid within 7 km. It can miss more distant
ridges and features smaller than the elevation grid or angular sampling. The
clearance describes a center line of sight and does not estimate solar array
power, partial disk visibility, or radio link performance.

## Reproduce the offline terrain case

The 13–14 January 2027 case uses NASA/JPL's
[generic SPICE kernels](https://naif.jpl.nasa.gov/pub/naif/generic_kernels/)
for apparent Sun and Earth positions at the same 2 m observer used by the terrain
profile. It uses the DE440 lunar frame aligned to DE421 and light-time and stellar
aberration corrections. The output is labeled SPICE, since normal mission queries
use JPL Horizons.

Download the following kernels to one directory and run the generator with
Python 3.11+, NumPy, and SpiceyPy:

- [de440s.bsp](https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de440s.bsp)
- [moon_pa_de440_200625.bpc](https://naif.jpl.nasa.gov/pub/naif/generic_kernels/pck/moon_pa_de440_200625.bpc)
- [moon_de440_250416.tf](https://naif.jpl.nasa.gov/pub/naif/generic_kernels/fk/satellites/moon_de440_250416.tf)
- [naif0012.tls](https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/naif0012.tls)

```text
python generate_obstruction_replay.py /path/to/kernel-directory
```

The replay records the checksums of the kernels and hourly samples. The first
change from positive to nonpositive solar clearance is between 12:00 and 13:00
UTC on 13 January. The interval brackets the change at the supplied resolution.
