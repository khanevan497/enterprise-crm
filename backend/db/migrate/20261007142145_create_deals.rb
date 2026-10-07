class CreateDeals < ActiveRecord::Migration[8.1]
  def change
    create_table :deals do |t|
      t.integer :organization_id
      t.integer :company_id
      t.integer :contact_id
      t.integer :owner_id
      t.string :title
      t.decimal :value, precision: 15, scale: 2
      t.string :currency
      t.string :stage
      t.integer :probability
      t.date :expected_close_date

      t.timestamps
    end
    add_index :deals, :organization_id
    add_index :deals, :stage
    add_index :deals, :owner_id
  end
end
