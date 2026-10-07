class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.integer :organization_id
      t.integer :assigned_to
      t.integer :created_by
      t.integer :contact_id
      t.integer :deal_id
      t.string :title
      t.text :description
      t.string :status
      t.string :priority
      t.datetime :due_at

      t.timestamps
    end
  end
end
