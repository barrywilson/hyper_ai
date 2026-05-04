const kafka = require('./kafka');

async function test() {
  await kafka.startKafka();
  console.log('Publishing test event...');
  await kafka.publishEvent('CREATE', { key: 'test-key', value: 'test-value' });
  console.log('Event published! Waiting to see if consumer catches it...');

  // Wait a few seconds for consumer to process it
  setTimeout(async () => {
    await kafka.shutdown();
    process.exit(0);
  }, 3000);
}

test();
