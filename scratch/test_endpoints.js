async function testEndpoints() {
    const url = 'http://localhost:5000/api/category/getAllCategories';
    
    console.log('Sending first request to category endpoint...');
    const res1 = await fetch(url);
    const data1 = await res1.json();
    console.log('Request 1 Success:', data1.success);
    console.log('Request 1 Message:', data1.message);

    console.log('Sending second request to category endpoint...');
    const res2 = await fetch(url);
    const data2 = await res2.json();
    console.log('Request 2 Success:', data2.success);
    console.log('Request 2 Message:', data2.message);
}

testEndpoints().catch(console.error);
