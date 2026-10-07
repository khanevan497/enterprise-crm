class Contact < ApplicationRecord
  belongs_to :organization
  belongs_to :company, optional: true
  belongs_to :owner, class_name: "User", optional: true
  has_many :deals, dependent: :nullify
  has_many :activities, dependent: :nullify
  has_many :tasks, dependent: :nullify

  STATUSES = %w[lead prospect customer inactive].freeze

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :organization_id, presence: true

  scope :for_org, ->(org_id) { where(organization_id: org_id) }

  def full_name
    "#{first_name} #{last_name}"
  end
end
