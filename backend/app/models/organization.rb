class Organization < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :companies, dependent: :destroy
  has_many :contacts, dependent: :destroy
  has_many :deals, dependent: :destroy
  has_many :activities, dependent: :destroy
  has_many :tasks, dependent: :destroy
  has_many :audit_logs, dependent: :destroy

  validates :name, presence: true
end
