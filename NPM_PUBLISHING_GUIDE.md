# NPM Publishing Guide

## Package Information
- **Package Name:** `@narasimhaponnada/mermaid-mcp-server`
- **Version:** 1.0.0
- **Scope:** @narasimhaponnada (your npm organization)
- **Access:** Public

## Prerequisites

1. **NPM Account:** Create at https://www.npmjs.com/signup
2. **Organization:** Create organization `@narasimhaponnada` (optional, or use unscoped name)
3. **Email Verified:** Ensure your NPM email is verified

## Publishing Steps

### Step 1: Login to NPM

```bash
cd /Users/narasimharao.ponnada/Documents/Mermaid/mermaid-mcp-server

# Login to NPM (will prompt for username, password, email)
npm login

# Verify login
npm whoami
```

### Step 2: Test the Package

```bash
# Test what will be published
npm pack --dry-run

# This shows all files that will be included
# Should see:
# - dist/
# - src/
# - examples/
# - generate-svg-samples.js
# - README.md
# - PROJECT-SUMMARY.md
# - LICENSE
# - tsconfig.json
```

### Step 3: Build and Verify

```bash
# Clean build
rm -rf dist/
npm run build

# Verify build output
ls -la dist/

# Should see:
# - index.js, index.d.ts
# - tools/, types/, utils/ folders
```

### Step 4: Test Installation Locally

```bash
# Create a test directory
mkdir -p /tmp/test-mcp-install
cd /tmp/test-mcp-install

# Install from local package
npm install /Users/narasimharao.ponnada/Documents/Mermaid/mermaid-mcp-server

# Test the binary
npx mermaid-mcp --help
```

### Step 5: Publish to NPM

```bash
cd /Users/narasimharao.ponnada/Documents/Mermaid/mermaid-mcp-server

# Publish (use --access public for scoped packages)
npm publish --access public

# Expected output:
# npm notice 
# npm notice 📦  @narasimhaponnada/mermaid-mcp-server@1.0.0
# npm notice === Tarball Contents === 
# npm notice [list of files]
# npm notice === Tarball Details === 
# + @narasimhaponnada/mermaid-mcp-server@1.0.0
```

### Step 6: Verify Publication

```bash
# Check on NPM
npm view @narasimhaponnada/mermaid-mcp-server

# Try installing from NPM
npm install -g @narasimhaponnada/mermaid-mcp-server

# Test the installed package
mermaid-mcp --version
```

## Alternative: Unscoped Package Name

If you prefer an unscoped name (easier to remember):

### Update package.json:
```json
{
  "name": "mermaid-mcp-server",
  ...
}
```

### Check availability:
```bash
npm search mermaid-mcp-server
# If no results, name is available
```

### Publish:
```bash
npm publish
# No --access flag needed for unscoped packages
```

## Post-Publishing Tasks

### 1. Update README with Installation

Add to your GitHub README:

```markdown
## Installation

### Via NPM (Recommended)

```bash
# Global installation
npm install -g @narasimhaponnada/mermaid-mcp-server

# Or per-project
npm install --save-dev @narasimhaponnada/mermaid-mcp-server
```

### Usage

```bash
# Run the server
mermaid-mcp

# Generate sample diagrams
mermaid-mcp generate-samples
```
\`\`\`

### 2. Add NPM Badge

Add to README.md:

```markdown
[![npm version](https://badge.fury.io/js/%40narasimhaponnada%2Fmermaid-mcp-server.svg)](https://www.npmjs.com/package/@narasimhaponnada/mermaid-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/@narasimhaponnada/mermaid-mcp-server.svg)](https://www.npmjs.com/package/@narasimhaponnada/mermaid-mcp-server)
```

### 3. Update Documentation

Update Setup.md and UserGuide.md with NPM installation instructions.

### 4. Create GitHub Release

```bash
# Tag the release
git tag -a v1.0.0 -m "Release v1.0.0 - Initial NPM publication"
git push origin v1.0.0

# Create GitHub release with notes
```

### 5. Announce on Social Media

**Twitter:**
```
🎉 Published mermaid-mcp-server to NPM!

Install: npm install -g @narasimhaponnada/mermaid-mcp-server

Generate professional diagrams with AI ✨

#npm #opensource #ai #mcp
```

## Version Updates (Future)

### Patch Update (Bug Fixes)
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm publish
```

### Minor Update (New Features)
```bash
npm version minor  # 1.0.0 -> 1.1.0
npm publish
```

### Major Update (Breaking Changes)
```bash
npm version major  # 1.0.0 -> 2.0.0
npm publish
```

## Troubleshooting

### Issue: "You do not have permission to publish"
**Solution:** Run `npm login` again or check organization permissions

### Issue: "Package name already exists"
**Solution:** Choose a different name or use scoped package

### Issue: "Files missing from package"
**Solution:** Check `files` array in package.json

### Issue: "Build files not included"
**Solution:** Run `npm run build` before `npm publish`

## NPM Package Stats

After publishing, track your package at:
- **Package Page:** https://www.npmjs.com/package/@narasimhaponnada/mermaid-mcp-server
- **Download Stats:** https://npm-stat.com/charts.html?package=@narasimhaponnada/mermaid-mcp-server

## Security

### Enable 2FA
```bash
npm profile enable-2fa auth-and-writes
```

### Regular Security Audits
```bash
npm audit
npm audit fix
```

## Best Practices

1. ✅ Always test locally before publishing
2. ✅ Use semantic versioning
3. ✅ Keep dependencies updated
4. ✅ Maintain comprehensive documentation
5. ✅ Respond to issues promptly
6. ✅ Add security policy
7. ✅ Create release notes for each version

## Expected Timeline

- **Day 1:** Publish to NPM
- **Week 1:** 10-50 downloads
- **Month 1:** 100-500 downloads
- **Month 3:** 500+ downloads (if well-promoted)

## Success Metrics

Track these metrics:
- 📈 Weekly downloads
- ⭐ GitHub stars
- 🐛 Issues opened/closed
- 💬 Community engagement
- 🔄 Update frequency

---

**Ready to publish?** Follow the steps above and your package will be live on NPM! 🚀
