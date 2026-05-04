const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const res = await fetch('http://localhost:8080/api/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ namespace: 'ai.course.config', version: 'v1', action: 'list', params: {} })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
