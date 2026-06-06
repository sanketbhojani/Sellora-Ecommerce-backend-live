async function test() {
    try {
        const response = await fetch("http://localhost:5000/api/auth/register/registerCustomer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: "Test User API",
                email: "test.api.123@gmail.com",
                password: "password123",
                confirmPassword: "password123",
                phone: "1234567890"
            })
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
