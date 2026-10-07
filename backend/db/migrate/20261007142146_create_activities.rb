class CreateActivities < ActiveRecord::Migration[8.1]
  def change
    create_table :activities do |t|
      t.integer :organization_id
      t.integer :user_id
      t.integer :contact_id
      t.integer :company_id
      t.integer :deal_id
      t.string :activity_type
      t.text :description
      t.jsonb :metadata

      t.timestamps
    end
  end
end
