class CreateContacts < ActiveRecord::Migration[8.1]
  def change
    create_table :contacts do |t|
      t.integer :organization_id
      t.integer :company_id
      t.string :first_name
      t.string :last_name
      t.string :email
      t.string :phone
      t.string :job_title
      t.string :status
      t.integer :owner_id

      t.timestamps
    end
  end
end
