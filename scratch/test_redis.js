import { getCache, setCache, deleteCache, deleteCachePattern } from '../config/redis.js';

async function runTest() {
    console.log('--- Starting Redis Functionality Test ---');

    console.log('Setting cache "test_key"...');
    const setSuccess = await setCache('test_key', { status: 'success', timestamp: Date.now() }, 60);
    console.log('Set Cache Result:', setSuccess);

    console.log('Getting cache "test_key"...');
    const cachedData = await getCache('test_key');
    console.log('Get Cache Result:', cachedData);

    console.log('Setting wildcard keys...');
    await setCache('products:list:test1', { item: 1 }, 60);
    await setCache('products:list:test2', { item: 2 }, 60);

    console.log('Deleting cache pattern "products:list:*"...');
    const deletePatternResult = await deleteCachePattern('products:list:*');
    console.log('Delete Pattern Result:', deletePatternResult);

    console.log('Verifying deleted wildcard keys...');
    const check1 = await getCache('products:list:test1');
    const check2 = await getCache('products:list:test2');
    console.log('products:list:test1 (should be null):', check1);
    console.log('products:list:test2 (should be null):', check2);

    console.log('Deleting "test_key"...');
    const delSuccess = await deleteCache('test_key');
    console.log('Delete Cache Result:', delSuccess);

    const checkFinal = await getCache('test_key');
    console.log('test_key (should be null):', checkFinal);

    console.log('--- Redis Functionality Test Finished ---');
    process.exit(0);
}

runTest().catch(err => {
    console.error('Test failed with error:', err);
    process.exit(1);
});
