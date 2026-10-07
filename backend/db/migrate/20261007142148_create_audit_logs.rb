class CreateAuditLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :audit_logs do |t|
      t.integer :organization_id
      t.integer :user_id
      t.string :action
      t.string :resource_type
      t.integer :resource_id
      t.jsonb :metadata
      t.string :ip_address

      t.timestamps
    end
  end
end
