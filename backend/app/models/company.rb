class Company < ApplicationRecord
  belongs_to :organization
  has_many :contacts, dependent: :nullify
  has_many :deals, dependent: :nullify
  has_many :activities, dependent: :nullify

  validates :name, presence: true
  validates :organization_id, presence: true

  scope :for_org, ->(org_id) { where(organization_id: org_id) }
end
