// Example script to simulate a webhook event
async function main() {
  const event = {
    id: 'evt_test_webhook',
    object: 'event',
    api_version: '2023-10-16',
    created: Date.now(),
    data: {
      object: {
        id: 'cs_test_123',
        object: 'checkout.session',
        metadata: {
          userId: 'test_user_id',
        },
        subscription: 'sub_test_123',
        customer: 'cus_test_123',
        amount_total: 499,
        currrency: 'eur',
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_test_123',
      idempotency_key: 'key_test_123',
    },
    type: 'checkout.session.completed',
  }

  console.log('Simulating webhook event:', event.type)

  // In a real local test, you would trigger this against the local API
  // curl -X POST http://localhost:3000/api/stripe/webhook ...

  console.log('To test, run:')
  console.log(
    `curl -X POST http://localhost:3000/api/stripe/webhook -H "Content-Type: application/json" -d '${JSON.stringify(event)}'`
  )
}

main().catch(console.error)
