require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  const email = (process.argv[2] || 'admin@hazardinspect.com').toLowerCase();
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Admin User';
  const phoneNumber = process.argv[5] || '0000000000';

  try {
    const { data: existing } = await supabase.from('users').select('id, email').eq('email', email).single();

    if (existing) {
      console.log('Admin user already exists. Updating password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await supabase
        .from('users')
        .update({ password: hashedPassword, role: 'admin', is_active: true, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      console.log('✓ Admin user updated successfully');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const { data: admin, error } = await supabase
        .from('users')
        .insert({
          email,
          phone_number: phoneNumber,
          password: hashedPassword,
          name,
          role: 'admin',
          is_active: true,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating admin:', error.message);
        process.exit(1);
      }
      console.log('✓ Admin user created successfully');
    }

    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
