class Task < ApplicationRecord
  belongs_to :organization
  belongs_to :assignee, class_name: "User", foreign_key: :assigned_to, optional: true
  belongs_to :creator, class_name: "User", foreign_key: :created_by, optional: true
  belongs_to :contact, optional: true
  belongs_to :deal, optional: true

  STATUSES = %w[todo in_progress completed cancelled].freeze
  PRIORITIES = %w[low medium high urgent].freeze

  validates :title, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :priority, inclusion: { in: PRIORITIES }
  validates :organization_id, presence: true

  scope :for_org, ->(org_id) { where(organization_id: org_id) }
  scope :pending, -> { where(status: %w[todo in_progress]) }
end
