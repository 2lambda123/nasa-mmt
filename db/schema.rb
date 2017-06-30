# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170630141235) do

  create_table "drafts", force: :cascade do |t|
    t.integer  "user_id"
    t.text     "draft"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.string   "short_name"
    t.string   "entry_title"
    t.string   "provider_id"
    t.string   "native_id"
    t.string   "draft_type"
  end

  create_table "user_invites", force: :cascade do |t|
    t.string   "manager_name"
    t.string   "manager_email"
    t.string   "user_first_name"
    t.string   "user_last_name"
    t.string   "user_email"
    t.string   "group_id"
    t.string   "group_name"
    t.string   "provider"
    t.string   "token"
    t.boolean  "active",          default: true
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
  end

  create_table "users", force: :cascade do |t|
    t.string   "urs_uid"
    t.datetime "created_at",          null: false
    t.datetime "updated_at",          null: false
    t.string   "echo_id"
    t.string   "provider_id"
    t.text     "available_providers"
  end

end
