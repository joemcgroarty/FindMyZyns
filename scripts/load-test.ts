/**
 * Load Test Configuration for FindMyZyns
 *
 * Run with k6: k6 run scripts/load-test.js
 * Or use this as documentation for load test scenarios.
 *
 * Scenarios:
 * 1. 500 concurrent sharing users broadcasting location every 10s
 * 2. 200 concurrent map viewers receiving Realtime updates
 * 3. 50 concurrent chat sessions with 1 message per 5 seconds
 * 4. 100 get_nearby_sharers RPC calls per minute
 *
 * Performance targets:
 * - get_nearby_sharers p95 < 300ms
 * - Realtime message delivery p95 < 500ms
 * - Edge Function response p95 < 1s
 * - DB CPU < 70% under peak load
 */

export const LOAD_TEST_CONFIG = {
  scenarios: {
    location_broadcasting: {
      description: '500 concurrent sharing users broadcasting location',
      concurrent_users: 500,
      interval_ms: 10000,
      duration_minutes: 10,
      endpoint: 'profiles.update({ location })',
    },
    map_viewers: {
      description: '200 concurrent map viewers',
      concurrent_users: 200,
      rpc: 'get_nearby_sharers',
      calls_per_minute: 100,
      duration_minutes: 10,
    },
    chat_sessions: {
      description: '50 concurrent chat sessions',
      concurrent_users: 50,
      messages_per_5_seconds: 1,
      duration_minutes: 10,
    },
  },
  targets: {
    spatial_query_p95_ms: 300,
    realtime_delivery_p95_ms: 500,
    edge_function_p95_ms: 1000,
    db_cpu_max_percent: 70,
  },
};

console.log('Load Test Configuration');
console.log('=======================');
console.log(JSON.stringify(LOAD_TEST_CONFIG, null, 2));
console.log('\nTo execute, set up k6 with the Supabase staging URL and run against staging.');
