class CreateCompanies < ActiveRecord::Migration[8.1]
  def change
    create_table :companies do |t|
      t.integer :organization_id
      t.string :name
      t.string :industry
      t.string :website
      t.string :phone
      t.text :description

      t.timestamps
    end
  end
end
