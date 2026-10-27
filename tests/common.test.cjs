const {test}=require('node:test'),assert=require('node:assert/strict');const {searchItems}=require('../public/app/common.js');
test('search supports blank keyword and returns empty when nothing matches',()=>{
 const items=[{val:'北五环事故'},{val:'Bus 14'}];
 assert.deepEqual(searchItems(items,' '),items);assert.deepEqual(searchItems(items,'五环'),[items[0]]);
 assert.deepEqual(searchItems(items,' BUS '),[items[1]]);assert.deepEqual(searchItems(items,'不存在'),[]);
});
