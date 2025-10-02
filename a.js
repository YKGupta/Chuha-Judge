
const response = await fetch('http://localhost:8080/api/runner/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        code: 'print("Hello, World! What")',
        language: 'python'
    })
});

console.log(await response.json());
