puts "Seeding database..."

AuditLog.delete_all
Activity.delete_all
Task.delete_all
Deal.delete_all
Contact.delete_all
Company.delete_all
User.delete_all
Organization.delete_all

org = Organization.create!(name: "Acme Sales Co")
org2 = Organization.create!(name: "Beta Corp")

owner = User.create!(organization: org, name: "Evan Khan", email: "evan@acmesales.co", password: "password123", role: "owner")
admin = User.create!(organization: org, name: "Sarah Chen", email: "sarah@acmesales.co", password: "password123", role: "admin")
manager = User.create!(organization: org, name: "Marcus Williams", email: "marcus@acmesales.co", password: "password123", role: "manager")
sales1 = User.create!(organization: org, name: "Ahmed Hassan", email: "ahmed@acmesales.co", password: "password123", role: "sales_representative")
sales2 = User.create!(organization: org, name: "Lisa Park", email: "lisa@acmesales.co", password: "password123", role: "sales_representative")

User.create!(organization: org2, name: "Beta Admin", email: "admin@betacorp.com", password: "password123", role: "owner")

companies_data = [
  { name: "TechGiant Inc", industry: "Technology", website: "https://techgiant.com", phone: "+1-555-0100", description: "Leading cloud infrastructure provider" },
  { name: "FinanceHub", industry: "Financial Services", website: "https://financehub.com", phone: "+1-555-0101", description: "Innovative fintech solutions" },
  { name: "HealthCorp", industry: "Healthcare", website: "https://healthcorp.com", phone: "+1-555-0102", description: "Healthcare management systems" },
  { name: "RetailMega", industry: "Retail", website: "https://retailmega.com", phone: "+1-555-0103", description: "Omnichannel retail platform" },
  { name: "EduLearn", industry: "Education", website: "https://edulearn.com", phone: "+1-555-0104", description: "Enterprise learning management" },
  { name: "ManufactPro", industry: "Manufacturing", website: "https://manufactpro.com", phone: "+1-555-0105", description: "Smart factory solutions" },
  { name: "LogiTrack", industry: "Logistics", website: "https://logitrack.com", phone: "+1-555-0106", description: "Supply chain optimization" },
  { name: "MediaFlow", industry: "Media", website: "https://mediaflow.com", phone: "+1-555-0107", description: "Digital media distribution" },
]
companies = companies_data.map { |c| Company.create!(c.merge(organization: org)) }

contacts_data = [
  { first_name: "James", last_name: "Rodriguez", email: "james.r@techgiant.com", phone: "+1-555-1001", job_title: "CTO", status: "customer", company: companies[0], owner: sales1 },
  { first_name: "Emily", last_name: "Watson", email: "emily.w@techgiant.com", phone: "+1-555-1002", job_title: "VP Engineering", status: "customer", company: companies[0], owner: sales1 },
  { first_name: "Robert", last_name: "Kim", email: "robert.k@financehub.com", phone: "+1-555-1003", job_title: "CFO", status: "prospect", company: companies[1], owner: sales2 },
  { first_name: "Sophia", last_name: "Martinez", email: "sophia.m@healthcorp.com", phone: "+1-555-1004", job_title: "CEO", status: "lead", company: companies[2], owner: sales1 },
  { first_name: "Daniel", last_name: "Thompson", email: "daniel.t@retailmega.com", phone: "+1-555-1005", job_title: "Head of IT", status: "prospect", company: companies[3], owner: sales2 },
  { first_name: "Olivia", last_name: "Brown", email: "olivia.b@edulearn.com", phone: "+1-555-1006", job_title: "Director", status: "customer", company: companies[4], owner: manager },
  { first_name: "William", last_name: "Davis", email: "william.d@manufactpro.com", phone: "+1-555-1007", job_title: "COO", status: "prospect", company: companies[5], owner: sales1 },
  { first_name: "Isabella", last_name: "Wilson", email: "isabella.w@logitrack.com", phone: "+1-555-1008", job_title: "VP Operations", status: "lead", company: companies[6], owner: sales2 },
  { first_name: "Michael", last_name: "Anderson", email: "michael.a@mediaflow.com", phone: "+1-555-1009", job_title: "CMO", status: "inactive", company: companies[7], owner: manager },
  { first_name: "Charlotte", last_name: "Taylor", email: "charlotte.t@financehub.com", phone: "+1-555-1010", job_title: "Head of Procurement", status: "customer", company: companies[1], owner: sales2 },
  { first_name: "Noah", last_name: "Jackson", email: "noah.j@techgiant.com", phone: "+1-555-1011", job_title: "Product Manager", status: "prospect", company: companies[0], owner: sales1 },
  { first_name: "Amelia", last_name: "White", email: "amelia.w@healthcorp.com", phone: "+1-555-1012", job_title: "CIO", status: "lead", company: companies[2], owner: sales2 },
]
contacts = contacts_data.map { |c| Contact.create!(c.merge(organization: org)) }

deals_data = [
  { title: "TechGiant Cloud Migration", value: 245000, stage: "negotiation", probability: 75, company: companies[0], contact: contacts[0], owner: sales1, expected_close_date: 30.days.from_now },
  { title: "FinanceHub Platform License", value: 128000, stage: "proposal", probability: 60, company: companies[1], contact: contacts[2], owner: sales2, expected_close_date: 45.days.from_now },
  { title: "HealthCorp EMR Integration", value: 89000, stage: "qualified", probability: 40, company: companies[2], contact: contacts[3], owner: sales1, expected_close_date: 60.days.from_now },
  { title: "RetailMega Omnichannel Suite", value: 320000, stage: "lead", probability: 20, company: companies[3], contact: contacts[4], owner: sales2, expected_close_date: 90.days.from_now },
  { title: "EduLearn LMS Enterprise", value: 56000, stage: "closed_won", probability: 100, company: companies[4], contact: contacts[5], owner: manager, expected_close_date: 5.days.ago },
  { title: "ManufactPro IoT Rollout", value: 175000, stage: "proposal", probability: 55, company: companies[5], contact: contacts[6], owner: sales1, expected_close_date: 40.days.from_now },
  { title: "LogiTrack Analytics", value: 67000, stage: "qualified", probability: 35, company: companies[6], contact: contacts[7], owner: sales2, expected_close_date: 55.days.from_now },
  { title: "MediaFlow CDN Contract", value: 42000, stage: "closed_lost", probability: 0, company: companies[7], contact: contacts[8], owner: manager, expected_close_date: 10.days.ago },
  { title: "TechGiant Security Audit", value: 95000, stage: "negotiation", probability: 80, company: companies[0], contact: contacts[1], owner: sales1, expected_close_date: 20.days.from_now },
  { title: "FinanceHub Compliance Tool", value: 210000, stage: "closed_won", probability: 100, company: companies[1], contact: contacts[9], owner: sales2, expected_close_date: 15.days.ago },
]
deals = deals_data.map { |d| Deal.create!(d.merge(organization: org, currency: "USD")) }

activity_entries = [
  ["Had discovery call, strong interest in enterprise plan", "call", 0, 0, 0],
  ["Sent product overview deck via email", "email", 1, 1, 1],
  ["Follow-up meeting completed — very positive", "meeting", 2, 2, 2],
  ["Left voicemail about upcoming renewal", "call", 3, 3, 3],
  ["Client raised pricing concerns — need to revise", "note", 4, 4, 4],
  ["Live demo completed, technical team loved it", "meeting", 0, 5, 5],
  ["Sent revised proposal with new pricing tier", "email", 1, 6, 6],
  ["Checked in on procurement timeline", "call", 2, 7, 7],
  ["Introduced to their technical architect", "meeting", 3, 8, 8],
  ["Pricing objection logged — follow up ASAP", "note", 4, 9, 9],
  ["Contract redlines received from legal team", "email", 0, 0, 0],
  ["Quarterly business review scheduled", "meeting", 1, 1, 1],
  ["Upsell discussion: add-on modules", "call", 2, 2, 2],
  ["Executive sponsor meeting — very aligned", "meeting", 3, 3, 3],
  ["Follow-up on security questionnaire", "email", 4, 4, 4],
  ["Champion contact changed — updating records", "note", 0, 5, 5],
  ["Trial extended by 2 weeks at client request", "note", 1, 6, 6],
  ["Reference call arranged with existing customer", "call", 2, 7, 7],
  ["Onboarding kickoff scheduled", "meeting", 3, 8, 8],
  ["Invoice sent — payment expected next week", "email", 4, 9, 9],
]

users_list = [owner, admin, manager, sales1, sales2]
activity_entries.each_with_index do |entry, i|
  desc, type, user_idx, contact_idx, deal_idx = entry
  Activity.create!(
    organization: org,
    user: users_list[user_idx],
    contact: contacts[contact_idx % contacts.length],
    company: contacts[contact_idx % contacts.length].company,
    deal: deals[deal_idx % deals.length],
    activity_type: type,
    description: desc,
    metadata: {},
    created_at: (20 - i).hours.ago
  )
end

tasks_data = [
  { title: "Follow up with TechGiant on contract redlines", status: "todo", priority: "high", assigned_to: sales1.id, contact: contacts[0], deal: deals[0], due_at: 2.days.from_now, description: "Review the legal redlines and schedule a call" },
  { title: "Prepare FinanceHub revised proposal", status: "in_progress", priority: "urgent", assigned_to: sales2.id, contact: contacts[2], deal: deals[1], due_at: 1.day.from_now, description: "Update pricing based on feedback from last call" },
  { title: "Schedule product demo for HealthCorp", status: "todo", priority: "medium", assigned_to: sales1.id, contact: contacts[3], due_at: 5.days.from_now, description: "Setup technical demo environment" },
  { title: "Send countersigned contract to EduLearn", status: "completed", priority: "high", assigned_to: manager.id, contact: contacts[5], deal: deals[4], due_at: 3.days.ago, description: "Contract execution complete" },
  { title: "Research ManufactPro IoT requirements", status: "todo", priority: "medium", assigned_to: sales1.id, contact: contacts[6], deal: deals[5], due_at: 7.days.from_now, description: "Understand their existing infrastructure" },
  { title: "Call LogiTrack VP about expanded scope", status: "todo", priority: "low", assigned_to: sales2.id, contact: contacts[7], due_at: 10.days.from_now, description: "Explore expansion into warehousing module" },
  { title: "Quarterly review with TechGiant team", status: "in_progress", priority: "high", assigned_to: manager.id, contact: contacts[1], due_at: 3.days.from_now, description: "Prepare QBR slides and metrics" },
  { title: "Update CRM notes from FinanceHub call", status: "todo", priority: "low", assigned_to: sales2.id, contact: contacts[9], due_at: 1.day.from_now, description: "Log all discussion points from last call" },
]

tasks_data.each { |t| Task.create!(t.merge(organization: org, created_by: owner.id)) }

audit_entries = [
  { action: "user.login", resource_type: "User", user: owner, resource_id: owner.id },
  { action: "contact.created", resource_type: "Contact", user: sales1, resource_id: contacts[0].id, meta: { name: contacts[0].full_name } },
  { action: "deal.created", resource_type: "Deal", user: sales1, resource_id: deals[0].id, meta: { title: deals[0].title } },
  { action: "deal.stage_changed", resource_type: "Deal", user: sales2, resource_id: deals[1].id, meta: { from: "qualified", to: "proposal" } },
  { action: "contact.updated", resource_type: "Contact", user: admin, resource_id: contacts[2].id },
  { action: "user.created", resource_type: "User", user: owner, resource_id: sales1.id },
  { action: "deal.stage_changed", resource_type: "Deal", user: sales1, resource_id: deals[0].id, meta: { from: "proposal", to: "negotiation" } },
  { action: "company.created", resource_type: "Company", user: admin, resource_id: companies[0].id },
  { action: "task.created", resource_type: "Task", user: manager, resource_id: 1 },
  { action: "deal.stage_changed", resource_type: "Deal", user: sales2, resource_id: deals[4].id, meta: { from: "negotiation", to: "closed_won" } },
]

audit_entries.each_with_index do |entry, i|
  AuditLog.create!(
    organization: org,
    user: entry[:user],
    action: entry[:action],
    resource_type: entry[:resource_type],
    resource_id: entry[:resource_id],
    metadata: entry[:meta] || {},
    ip_address: "192.168.1.#{10 + i}",
    created_at: (audit_entries.length - i).hours.ago
  )
end

puts "Seeded:"
puts "  #{Organization.count} organizations"
puts "  #{User.count} users (across all orgs)"
puts "  #{Company.count} companies"
puts "  #{Contact.count} contacts"
puts "  #{Deal.count} deals"
puts "  #{Activity.count} activities"
puts "  #{Task.count} tasks"
puts "  #{AuditLog.count} audit log entries"
puts ""
puts "Login credentials:"
puts "  Owner:   evan@acmesales.co / password123"
puts "  Admin:   sarah@acmesales.co / password123"
puts "  Manager: marcus@acmesales.co / password123"
puts "  Sales:   ahmed@acmesales.co / password123"
