## ITD — Language Image Strategy for Container Execution Service

### Summary statement
Maintain dedicated, minimal, hardened language runtime images built via multi-stage Dockerfiles, stored in a private registry, scanned automatically for vulnerabilities, signed, and referenced by digest in runner configuration. Runtime images must run as non-root, contain only required runtime files, and be rebuilt on a defined cadence for base image updates.

### Context
The execution service must support multiple languages (e.g., C++, Python, Java) while ensuring predictable, secure, and reproducible execution environments. Language runtime images form the basis for container execution security and stability. Using public, unpinned images risks security vulnerabilities, unpredictable changes, and larger-than-necessary attack surfaces.

An ideal image strategy would:
- Be reproducible and deterministic.
- Enforce minimal runtime environments with least privilege.
- Allow vulnerability scanning and compliance checks before deployment.
- Support per-language customization while maintaining consistent security controls.

### Problem to solve
Select a secure and maintainable strategy for building and using language runtime images for executing untrusted user code in the container runner.

### Options

#### Option 1 — Use official images directly
Fastest to start but less control, larger attack surface, and unpredictability due to floating tags.

#### Option 2 — Build hardened images via multi-stage Dockerfiles (selected)
Use official images as builders only; produce minimal, non-root runtime images pinned by digest, stored in a private registry, scanned and signed.

#### Option 3 — Use prebuilt hardened minimal images (distroless)
Very small runtime images; may lack some runtime tooling, requiring adjustments.

#### Option 4 — Runtime from compiled artifacts only
Compile code in a builder stage and copy only binary to a scratch/distroless image; best for compiled languages.

### Selected option
**Option 2 (Build hardened multi-stage images)** for each language, using official base images for building but producing minimal runtime images with:
- Non-root user set.
- No package managers or shells in runtime.
- Digest pinning and signature verification.
- Automated vulnerability scanning and SBOM generation.

### Reasoning
- Provides full control over runtime content and security posture.
- Eliminates reliance on floating tags; digest pinning guarantees reproducibility.
- Multi-stage builds reduce runtime size and attack surface by excluding compilers/tools.
- Private registry storage with access control prevents unauthorized changes.

### Risks
1. **Operational overhead** — must maintain build pipelines, scanning, and signing for all supported languages.
2. **Compatibility risk** — overly minimal images may omit required runtime files, causing failures.
3. **Security gaps if policy not enforced** — floating tags or unscanned images could bypass controls.
4. **Image bloat** — if not monitored, images may grow and slow cold starts.

### Mandatory mitigations
- **Build pipeline**:
  - Multi-stage Dockerfiles per language.
  - Non-root `USER` in runtime.
  - Minimal runtime base (distroless/scratch/slim).
  - Pin base images by digest.
  - Generate SBOM for each build.
  - Run vulnerability scan (e.g., Trivy/Snyk) and fail on critical CVEs.
  - Sign images (cosign) after successful scan.
  - Push to private registry with immutable tags.

- **Runner enforcement**:
  - Pull images by digest only; reject floating tags.
  - Verify image signature before use.
  - Refuse images failing vulnerability threshold.

- **Operational**:
  - Schedule auto-rebuilds when base images are updated.
  - Maintain rollback capability with previous known-good images.
  - Monitor image sizes and enforce maximum size threshold.

### Tests & validation
- **Build-time**:
  - Check `USER` is non-root.
  - Verify absence of package managers/shell in runtime.
  - Assert digest is recorded and signature generated.
  - Scan image and block on critical CVEs.

- **Runtime**:
  - Integration test: run sample programs for each language/version.
  - Verify container runs as non-root.
  - Measure cold start latency and enforce performance budget.

- **Security**:
  - Verify signature validation fails for tampered images.
  - Periodically rescan stored images in registry and alert on new CVEs.

### Acceptance criteria
- [ ] Per-language multi-stage Dockerfiles exist for all supported languages.
- [ ] Runtime images run as non-root, contain only minimal runtime dependencies, and no package managers/shell.
- [ ] Images built in CI, scanned, signed, and pushed to private registry.
- [ ] Runner config references images by digest and verifies signature.
- [ ] Vulnerability scans block images with critical CVEs.
- [ ] SBOM stored with image metadata.
- [ ] Automated rebuild policy in place for base image updates.
- [ ] Per-language sample suite passes in CI against pinned digest.
- [ ] Image size threshold enforced and monitored.
- [ ] Documentation on image build, update, and rollback process available in repo.

### Migration & future-proofing
- New languages added via the same multi-stage build pattern.
- Runner adapter supports per-language image config, enabling future migration to alternative base images or runtimes (e.g., gVisor-compatible).
- Evaluate automated rebuild and re-sign pipelines for faster CVE response.
