class Activity < ApplicationRecord
  belongs_to :organization
  belongs_to :user, optional: true
  belongs_to :contact, optional: true
  belongs_to :company, optional: true
  belongs_to :deal, optional: true

  TYPES = %w[note call email meeting status_change deal_update].freeze

  validates :activity_type, inclusion: { in: TYPES }
  validates :organization_id, presence: true

  scope :for_org, ->(org_id) { where(organization_id: org_id) }
  scope :recent, -> { order(created_at: :desc) }
end
