RELEASE INSTRUCTIONS
====================

1. Set correct version in `package.json`
2. Set correct version in `app/js/editor.js`
3. Set correct version in `CHANGELOG.md`
4. npm run deploy
5. npm publish --access=public
6. git commit -m "Release 0.3.0"
7. git tag v0.3.0
8. git push origin v0.3.0
9. npm publish --access=public
