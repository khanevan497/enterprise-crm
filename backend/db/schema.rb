# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_07_142148) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "activities", force: :cascade do |t|
    t.integer "organization_id"
    t.integer "user_id"
    t.integer "contact_id"
    t.integer "company_id"
    t.integer "deal_id"
    t.string "activity_type"
    t.text "description"
    t.jsonb "metadata"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "audit_logs", force: :cascade do |t|
    t.integer "organization_id"
    t.integer "user_id"
    t.string "action"
    t.string "resource_type"
    t.integer "resource_id"
    t.jsonb "metadata"
    t.string "ip_address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "companies", force: :cascade do |t|
    t.integer "organization_id"
    t.string "name"
    t.string "industry"
    t.string "website"
    t.string "phone"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "contacts", force: :cascade do |t|
    t.integer "organization_id"
    t.integer "company_id"
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.string "phone"
    t.string "job_title"
    t.string "status"
    t.integer "owner_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "deals", force: :cascade do |t|
    t.integer "organization_id"
    t.integer "company_id"
    t.integer "contact_id"
    t.integer "owner_id"
    t.string "title"
    t.decimal "value", precision: 15, scale: 2
    t.string "currency"
    t.string "stage"
    t.integer "probability"
    t.date "expected_close_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_deals_on_organization_id"
    t.index ["owner_id"], name: "index_deals_on_owner_id"
    t.index ["stage"], name: "index_deals_on_stage"
  end

  create_table "organizations", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_organizations_on_name"
  end

  create_table "tasks", force: :cascade do |t|
    t.integer "organization_id"
    t.integer "assigned_to"
    t.integer "created_by"
    t.integer "contact_id"
    t.integer "deal_id"
    t.string "title"
    t.text "description"
    t.string "status"
    t.string "priority"
    t.datetime "due_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.integer "organization_id"
    t.string "name"
    t.string "email"
    t.string "password_digest"
    t.string "role"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["organization_id"], name: "index_users_on_organization_id"
    t.index ["role"], name: "index_users_on_role"
  end
end
