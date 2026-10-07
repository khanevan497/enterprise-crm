class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.integer :organization_id
      t.string :name
      t.string :email
      t.string :password_digest
      t.string :role

      t.timestamps
    end
    add_index :users, :email, unique: true
    add_index :users, :role
    add_index :users, :organization_id
  end
end
