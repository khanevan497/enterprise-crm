class AuditLog < ApplicationRecord
  belongs_to :organization
  belongs_to :user, optional: true

  validates :action, presence: true
  validates :resource_type, presence: true
  validates :organization_id, presence: true

  scope :for_org, ->(org_id) { where(organization_id: org_id) }
  scope :recent, -> { order(created_at: :desc) }

  def self.log(organization_id:, user_id:, action:, resource_type:, resource_id:, metadata: {}, ip_address: nil)
    create!(
      organization_id: organization_id,
      user_id: user_id,
      action: action,
      resource_type: resource_type,
      resource_id: resource_id,
      metadata: metadata,
      ip_address: ip_address
    )
  end
end
