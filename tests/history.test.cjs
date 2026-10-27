const {test}=require('node:test');const assert=require('node:assert/strict');const cp=require('node:child_process');const fs=require('node:fs');
test('all three original tips are ancestors of the integrated branch',()=>{
for(const sha of ['6e11f3590445ebe9390b575009db2072960f859a','5f53366467a5c8825fd7405c775a31d77da860e0','b88c4d2fc12ee81d7170feef0fb29cdc079c8a1e'])cp.execFileSync('git',['merge-base','--is-ancestor',sha,'HEAD']);
});
test('each migrated source file has a verifiable destination or original history location',()=>{
assert.ok(fs.existsSync('docs/source-manifest.json'),'source manifest missing');
const manifest=JSON.parse(fs.readFileSync('docs/source-manifest.json'));
assert.equal(manifest.files.length,159);
for(const file of manifest.files){
 const bytes=file.target?fs.readFileSync(file.target):cp.execFileSync('git',['show',`${file.commit}:${file.path}`]);
 assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),file.sha256,`${file.repository}/${file.path}`);
}
});
