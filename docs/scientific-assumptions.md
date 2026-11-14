# Scientific Assumptions & Limitations

1. **Geometric Horizon Model**: Initial sunlight and Earth visibility use geometric elevation angles (`elevation_deg > 0`) without full terrain-obstruction raytracing.
2. **Terrain Effects**: Mountains and crater walls can block sunlight or Earth line-of-sight; geometric visibility is an upper bound.
3. **Solar Power Estimation**: Solar elevation indicates illumination availability, not actual array power output.
4. **Communication Availability**: Geometric Earth line-of-sight does not guarantee link budget or radio availability.
5. **Temporal Accuracy**: Durations depend on sampling step (`step_minutes`); coarse steps may miss brief transitions.
6. **AI Safety**: HELIOS never invents astronomical measurements; all numeric outputs come from the scientific engine.
