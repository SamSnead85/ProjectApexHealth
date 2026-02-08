/**
 * Database Seed Script
 * Populates the database with realistic healthcare data for development and demos.
 * 
 * Usage: npx ts-node src/database/seed.ts
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'apex_admin',
  password: process.env.DB_PASSWORD || 'apex_dev_password_2024',
  database: process.env.DB_DATABASE || 'apex_health',
});

async function seed() {
  await dataSource.initialize();
  const qr = dataSource.createQueryRunner();
  console.log('🏥 Seeding Apex Health Platform database...\n');

  try {
    // ═══════════════════════════════════════════════
    // Organizations
    // ═══════════════════════════════════════════════
    console.log('📋 Seeding organizations...');
    const orgId = '10000000-0000-0000-0000-000000000001';
    const employerOrgId = '10000000-0000-0000-0000-000000000002';

    await qr.query(`
      INSERT INTO org.organizations (id, name, slug, type, tax_id, npi, cms_id, address_line1, city, state, zip, phone, email, website, licensed_modules, is_active)
      VALUES
        ($1, 'Apex Health Plan', 'apex-health', 'payer', '12-3456789', '1234567890', 'H1234',
         '100 Healthcare Blvd', 'Austin', 'TX', '78701', '(512) 555-0100', 'admin@apexhealth.com', 'https://apexhealth.com',
         ARRAY['claims-intelligence','eligibility-hub','prior-auth-center','provider-network','member-experience','revenue-cycle','analytics-command','compliance-suite','ai-operations','voice-center'],
         true),
        ($2, 'TechCorp Industries', 'techcorp', 'employer', '98-7654321', NULL, NULL,
         '500 Innovation Way', 'San Francisco', 'CA', '94105', '(415) 555-0200', 'hr@techcorp.com', 'https://techcorp.com',
         ARRAY['eligibility-hub','member-experience'], true)
      ON CONFLICT (slug) DO NOTHING
    `, [orgId, employerOrgId]);

    // ═══════════════════════════════════════════════
    // Users
    // ═══════════════════════════════════════════════
    console.log('👤 Seeding users...');
    const passwordHash = await bcrypt.hash('ApexDemo2024!', 12);

    const users = [
      { email: 'sarah.chen@apexhealth.com', first: 'Sarah', last: 'Chen', role: 'org_admin', dept: 'Administration', title: 'Platform Administrator' },
      { email: 'marcus.johnson@apexhealth.com', first: 'Marcus', last: 'Johnson', role: 'claims_supervisor', dept: 'Claims', title: 'Claims Supervisor' },
      { email: 'dr.emily.park@apexhealth.com', first: 'Emily', last: 'Park', role: 'medical_director', dept: 'Medical Affairs', title: 'Medical Director' },
      { email: 'lisa.rodriguez@apexhealth.com', first: 'Lisa', last: 'Rodriguez', role: 'claims_processor', dept: 'Claims', title: 'Senior Claims Processor' },
      { email: 'david.kim@apexhealth.com', first: 'David', last: 'Kim', role: 'analyst', dept: 'Analytics', title: 'Data Analyst' },
      { email: 'rachel.thompson@apexhealth.com', first: 'Rachel', last: 'Thompson', role: 'care_manager', dept: 'Care Management', title: 'Care Manager' },
      { email: 'james.wilson@member.apexhealth.com', first: 'James', last: 'Wilson', role: 'member', dept: null, title: null },
      { email: 'michael.torres@broker.com', first: 'Michael', last: 'Torres', role: 'broker', dept: null, title: 'Senior Broker' },
      { email: 'patricia.morrison@techcorp.com', first: 'Patricia', last: 'Morrison', role: 'employer_admin', dept: 'HR', title: 'VP Human Resources' },
      { email: 'compliance@apexhealth.com', first: 'Robert', last: 'Singh', role: 'auditor', dept: 'Compliance', title: 'Chief Compliance Officer' },
    ];

    for (const u of users) {
      const uOrgId = u.role === 'employer_admin' ? employerOrgId : orgId;
      await qr.query(`
        INSERT INTO auth.users (id, email, first_name, last_name, role, organization_id, department, title, password_hash, is_active, password_changed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW())
        ON CONFLICT DO NOTHING
      `, [uuid(), u.email, u.first, u.last, u.role, uOrgId, u.dept, u.title, passwordHash]);
    }

    // ═══════════════════════════════════════════════
    // Benefit Plans
    // ═══════════════════════════════════════════════
    console.log('📋 Seeding benefit plans...');
    const plans = [
      { name: 'Apex PPO Gold', id: 'PPO-GOLD-2024', type: 'PPO', metal: 'gold', dedInd: 1000, dedFam: 2500, oopInd: 5000, oopFam: 10000 },
      { name: 'Apex PPO Silver', id: 'PPO-SILVER-2024', type: 'PPO', metal: 'silver', dedInd: 2000, dedFam: 4000, oopInd: 7000, oopFam: 14000 },
      { name: 'Apex HMO Platinum', id: 'HMO-PLAT-2024', type: 'HMO', metal: 'platinum', dedInd: 500, dedFam: 1000, oopInd: 3000, oopFam: 6000 },
      { name: 'Apex HDHP Bronze', id: 'HDHP-BRONZE-2024', type: 'HDHP', metal: 'bronze', dedInd: 3000, dedFam: 6000, oopInd: 8150, oopFam: 16300 },
    ];

    for (const p of plans) {
      await qr.query(`
        INSERT INTO member.benefit_plans (id, organization_id, plan_name, plan_id, plan_type, effective_date, is_active, metal_level,
          deductibles, oop_maximums, premiums)
        VALUES ($1, $2, $3, $4, $5, '2024-01-01', true, $6,
          $7::jsonb, $8::jsonb, $9::jsonb)
        ON CONFLICT DO NOTHING
      `, [
        uuid(), orgId, p.name, p.id, p.type, p.metal,
        JSON.stringify({ individualInNetwork: p.dedInd, individualOutOfNetwork: p.dedInd * 2, familyInNetwork: p.dedFam, familyOutOfNetwork: p.dedFam * 2 }),
        JSON.stringify({ individualInNetwork: p.oopInd, individualOutOfNetwork: p.oopInd * 2, familyInNetwork: p.oopFam, familyOutOfNetwork: p.oopFam * 2 }),
        JSON.stringify({ employeeOnly: 450, employeeSpouse: 950, employeeChildren: 800, family: 1250 }),
      ]);
    }

    // ═══════════════════════════════════════════════
    // Members
    // ═══════════════════════════════════════════════
    console.log('👥 Seeding members...');
    const members = [
      { mid: 'AHP100001', first: 'James', last: 'Wilson', dob: '1985-03-15', gender: 'male', plan: 'PPO-GOLD-2024', group: 'GRP-TECHCORP' },
      { mid: 'AHP100002', first: 'Maria', last: 'Santos', dob: '1978-07-22', gender: 'female', plan: 'HMO-PLAT-2024', group: 'GRP-TECHCORP' },
      { mid: 'AHP100003', first: 'Robert', last: 'Anderson', dob: '1962-11-08', gender: 'male', plan: 'PPO-GOLD-2024', group: 'GRP-APEX' },
      { mid: 'AHP100004', first: 'Jennifer', last: 'Liu', dob: '1990-01-30', gender: 'female', plan: 'HDHP-BRONZE-2024', group: 'GRP-TECHCORP' },
      { mid: 'AHP100005', first: 'William', last: 'Chen', dob: '1955-09-12', gender: 'male', plan: 'PPO-SILVER-2024', group: 'GRP-APEX' },
      { mid: 'AHP100006', first: 'Sarah', last: 'Thompson', dob: '1988-05-18', gender: 'female', plan: 'PPO-GOLD-2024', group: 'GRP-TECHCORP' },
      { mid: 'AHP100007', first: 'Michael', last: 'Brown', dob: '1972-12-03', gender: 'male', plan: 'HMO-PLAT-2024', group: 'GRP-APEX' },
      { mid: 'AHP100008', first: 'Emily', last: 'Davis', dob: '1995-08-25', gender: 'female', plan: 'HDHP-BRONZE-2024', group: 'GRP-TECHCORP' },
    ];

    for (const m of members) {
      await qr.query(`
        INSERT INTO member.members (id, organization_id, member_id, subscriber_id, relationship, first_name, last_name,
          date_of_birth, gender, status, effective_date, plan_id, plan_name, group_id, group_name, address)
        VALUES ($1, $2, $3, $3, 'self', $4, $5, $6, $7, 'active', '2024-01-01', $8, $8, $9, $9,
          '{"line1":"123 Main St","city":"Austin","state":"TX","zip":"78701"}'::jsonb)
        ON CONFLICT DO NOTHING
      `, [uuid(), orgId, m.mid, m.first, m.last, m.dob, m.gender, m.plan, m.group]);
    }

    // ═══════════════════════════════════════════════
    // Providers
    // ═══════════════════════════════════════════════
    console.log('🏥 Seeding providers...');
    const providers = [
      { npi: '1234567890', first: 'Sarah', last: 'Johnson', spec: 'Internal Medicine', cred: 'MD', tier: 'preferred', tax: '987654321' },
      { npi: '2345678901', first: 'Robert', last: 'Martinez', spec: 'Orthopedic Surgery', cred: 'MD', tier: 'preferred', tax: '876543210' },
      { npi: '3456789012', first: 'Emily', last: 'Park', spec: 'Cardiology', cred: 'MD', tier: 'standard', tax: '765432109' },
      { npi: '4567890123', first: 'David', last: 'Kim', spec: 'Family Medicine', cred: 'DO', tier: 'preferred', tax: '654321098' },
      { npi: '5678901234', first: 'Lisa', last: 'Patel', spec: 'Dermatology', cred: 'MD', tier: 'standard', tax: '543210987' },
      { npi: '6789012345', first: 'Mark', last: 'Thompson', spec: 'Psychiatry', cred: 'MD', tier: 'preferred', tax: '432109876' },
    ];

    for (const p of providers) {
      await qr.query(`
        INSERT INTO provider.providers (id, organization_id, npi, type, status, network_tier, first_name, last_name,
          display_name, credentials, specialty, taxonomy_code, phone, accepting_new_patients,
          credentialing_status, license_number, license_state, license_expiration_date, board_certified,
          address, quality_score, patient_satisfaction_score)
        VALUES ($1, $2, $3, 'individual', 'active', $4, $5, $6, $7, $8, $9, '207R00000X', '(512) 555-' || floor(random()*9000+1000)::text,
          true, 'approved', 'TX-' || $3, 'TX', '2026-12-31', true,
          '{"line1":"' || floor(random()*999+1)::text || ' Medical Center Dr","city":"Austin","state":"TX","zip":"78701","latitude":30.2672,"longitude":-97.7431}'::jsonb,
          $10, $11)
        ON CONFLICT DO NOTHING
      `, [uuid(), orgId, p.npi, p.tier, p.first, p.last, `Dr. ${p.first} ${p.last}, ${p.cred}`, p.cred, p.spec,
          Math.round((80 + Math.random() * 20) * 10) / 10, Math.round((40 + Math.random() * 10) * 10) / 10]);
    }

    // ═══════════════════════════════════════════════
    // Claims
    // ═══════════════════════════════════════════════
    console.log('📄 Seeding claims...');
    const claimStatuses = ['received', 'validated', 'in_review', 'adjudicated', 'approved', 'denied', 'paid'];
    const diagnosisCodes = [
      { code: 'M54.5', desc: 'Low back pain' },
      { code: 'J06.9', desc: 'Acute upper respiratory infection' },
      { code: 'E11.65', desc: 'Type 2 diabetes with hyperglycemia' },
      { code: 'I10', desc: 'Essential hypertension' },
      { code: 'F32.1', desc: 'Major depressive disorder, moderate' },
      { code: 'M79.3', desc: 'Panniculitis' },
      { code: 'K21.0', desc: 'GERD with esophagitis' },
      { code: 'J45.20', desc: 'Mild intermittent asthma' },
    ];
    const procedureCodes = [
      { code: '99213', desc: 'Office visit, established, low', charge: 150 },
      { code: '99214', desc: 'Office visit, established, moderate', charge: 225 },
      { code: '99215', desc: 'Office visit, established, high', charge: 350 },
      { code: '99203', desc: 'Office visit, new patient, low', charge: 200 },
      { code: '99385', desc: 'Preventive visit, 18-39 years', charge: 275 },
      { code: '71046', desc: 'Chest X-ray, 2 views', charge: 180 },
      { code: '80053', desc: 'Comprehensive metabolic panel', charge: 95 },
      { code: '36415', desc: 'Venipuncture', charge: 25 },
    ];

    for (let i = 1; i <= 50; i++) {
      const member = members[Math.floor(Math.random() * members.length)];
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const diag = diagnosisCodes[Math.floor(Math.random() * diagnosisCodes.length)];
      const proc = procedureCodes[Math.floor(Math.random() * procedureCodes.length)];
      const status = claimStatuses[Math.floor(Math.random() * claimStatuses.length)];
      const charged = proc.charge + Math.floor(Math.random() * 100);
      const allowed = Math.round(charged * 0.75);
      const paid = status === 'denied' ? 0 : Math.round(allowed * 0.8);
      const memberResp = allowed - paid;
      const daysAgo = Math.floor(Math.random() * 90);
      const serviceDate = new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];
      const receivedDate = new Date(Date.now() - (daysAgo - 2) * 86400000).toISOString().split('T')[0];

      await qr.query(`
        INSERT INTO claims.claims (id, organization_id, claim_number, type, status, source,
          member_id, subscriber_id, patient_first_name, patient_last_name, patient_dob, patient_gender, member_plan_id,
          rendering_provider_id, rendering_provider_npi, rendering_provider_name,
          place_of_service_code, service_from_date, service_to_date, received_date,
          primary_diagnosis_code, primary_diagnosis_description, additional_diagnosis_codes,
          total_charged_amount, total_allowed_amount, total_paid_amount, total_member_responsibility,
          total_deductible, total_copay, total_coinsurance,
          ai_confidence_score, ai_recommendation, notes, adjustment_codes)
        VALUES ($1, $2, $3, 'professional', $4, 'portal',
          $5, $5, $6, $7, $8, $9, $10,
          $11, $12, $13,
          '11', $14, $14, $15,
          $16, $17, '[]'::jsonb,
          $18, $19, $20, $21, $22, $23, $24,
          $25, $26, '[]'::jsonb, '[]'::jsonb)
        ON CONFLICT DO NOTHING
      `, [
        uuid(), orgId, `CLM-2024-${String(i).padStart(6, '0')}`, status,
        member.mid, member.first, member.last, member.dob, member.gender, member.plan,
        uuid(), provider.npi, `Dr. ${provider.first} ${provider.last}`,
        serviceDate, receivedDate,
        diag.code, diag.desc,
        charged, allowed, paid, memberResp,
        Math.min(memberResp * 0.4, 100), 25, Math.max(memberResp - 125, 0),
        Math.round((70 + Math.random() * 25) * 100) / 100,
        ['approve', 'approve', 'approve', 'review', 'deny'][Math.floor(Math.random() * 5)],
      ]);
    }

    // ═══════════════════════════════════════════════
    // Prior Authorizations
    // ═══════════════════════════════════════════════
    console.log('📝 Seeding prior authorizations...');
    const paStatuses = ['submitted', 'in_review', 'approved', 'denied', 'pending_info'];
    const paProcedures = [
      { code: '27447', desc: 'Total knee replacement' },
      { code: '27130', desc: 'Total hip arthroplasty' },
      { code: '70553', desc: 'MRI brain with and without contrast' },
      { code: '43239', desc: 'Upper GI endoscopy with biopsy' },
      { code: '29881', desc: 'Arthroscopy, knee, surgical' },
    ];

    for (let i = 1; i <= 15; i++) {
      const member = members[Math.floor(Math.random() * members.length)];
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const proc = paProcedures[Math.floor(Math.random() * paProcedures.length)];
      const status = paStatuses[Math.floor(Math.random() * paStatuses.length)];
      const urgency = Math.random() > 0.7 ? 'urgent' : 'standard';
      const daysAgo = Math.floor(Math.random() * 30);
      const submittedAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
      const slaHours = urgency === 'urgent' ? 72 : 168;
      const slaDeadline = new Date(new Date(submittedAt).getTime() + slaHours * 3600000).toISOString();

      await qr.query(`
        INSERT INTO claims.prior_authorizations (id, organization_id, auth_number, status, urgency, type,
          member_id, member_name, member_dob, plan_id,
          requesting_provider_id, requesting_provider_npi, requesting_provider_name, requesting_provider_specialty,
          primary_diagnosis_code, primary_diagnosis_description, additional_diagnosis_codes,
          requested_procedures, clinical_notes, clinical_documents,
          submitted_at, sla_deadline, sla_status, days_in_review,
          ai_recommendation, ai_confidence_score)
        VALUES ($1, $2, $3, $4, $5, 'procedure',
          $6, $7, $8, $9,
          $10, $11, $12, $13,
          $14, $15, '[]'::jsonb,
          $16::jsonb, 'Clinical documentation supports medical necessity for the requested procedure.', ARRAY[]::text[],
          $17, $18, $19, $20,
          $21, $22)
        ON CONFLICT DO NOTHING
      `, [
        uuid(), orgId, `PA-2024-${String(i).padStart(6, '0')}`, status, urgency,
        member.mid, `${member.first} ${member.last}`, member.dob, member.plan,
        uuid(), provider.npi, `Dr. ${provider.first} ${provider.last}`, provider.spec,
        'M17.11', 'Primary osteoarthritis, right knee',
        JSON.stringify([{ procedureCode: proc.code, procedureDescription: proc.desc, requestedUnits: 1, fromDate: submittedAt.split('T')[0], toDate: submittedAt.split('T')[0], status: 'pending' }]),
        submittedAt, slaDeadline,
        daysAgo > (urgency === 'urgent' ? 3 : 7) ? 'overdue' : daysAgo > (urgency === 'urgent' ? 2 : 5) ? 'at_risk' : 'on_track',
        daysAgo,
        ['approve', 'approve', 'review', 'deny'][Math.floor(Math.random() * 4)],
        Math.round((65 + Math.random() * 30) * 100) / 100,
      ]);
    }

    // ═══════════════════════════════════════════════
    // Invoices & Payments
    // ═══════════════════════════════════════════════
    console.log('💰 Seeding invoices and payments...');
    for (let month = 1; month <= 3; month++) {
      const invoiceId = uuid();
      const amount = 125000 + Math.floor(Math.random() * 50000);
      await qr.query(`
        INSERT INTO billing.invoices (id, organization_id, invoice_number, status, entity_type, entity_id, entity_name,
          subtotal_amount, tax_amount, adjustment_amount, total_amount, paid_amount, balance_due,
          invoice_date, due_date, period_start_date, period_end_date, line_items)
        VALUES ($1, $2, $3, $4, 'employer_group', $5, 'TechCorp Industries',
          $6, 0, 0, $6, $7, $8,
          $9, $10, $11, $12, '[]'::jsonb)
        ON CONFLICT DO NOTHING
      `, [
        invoiceId, orgId, `INV-2024-${String(month).padStart(4, '0')}`,
        month <= 2 ? 'paid' : 'sent',
        employerOrgId,
        amount, month <= 2 ? amount : 0, month <= 2 ? 0 : amount,
        `2024-${String(month).padStart(2, '0')}-01`,
        `2024-${String(month).padStart(2, '0')}-15`,
        `2024-${String(month).padStart(2, '0')}-01`,
        `2024-${String(month).padStart(2, '0')}-${month === 2 ? '29' : '30'}`,
      ]);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('   Organizations: 2');
    console.log('   Users: 10 (password: ApexDemo2024!)');
    console.log('   Benefit Plans: 4');
    console.log('   Members: 8');
    console.log('   Providers: 6');
    console.log('   Claims: 50');
    console.log('   Prior Authorizations: 15');
    console.log('   Invoices: 3');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await qr.release();
    await dataSource.destroy();
  }
}

seed().catch(console.error);
