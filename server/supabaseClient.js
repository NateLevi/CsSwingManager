const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env' });

// Service role key for server access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase; 