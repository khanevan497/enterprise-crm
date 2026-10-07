class User < ApplicationRecord
  belongs_to :organization
  has_secure_password

  ROLES = %w[owner admin manager sales_representative viewer].freeze

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, inclusion: { in: ROLES }

  def can?(action)
    permissions = {
      owner: %w[manage_organization manage_users create_contacts edit_contacts delete_contacts create_deals view_dashboard view_audit_logs],
      admin: %w[manage_organization manage_users create_contacts edit_contacts delete_contacts create_deals view_dashboard view_audit_logs],
      manager: %w[create_contacts edit_contacts create_deals view_dashboard view_audit_logs],
      sales_representative: %w[create_contacts edit_contacts create_deals view_dashboard],
      viewer: %w[view_dashboard]
    }
    permissions[role.to_sym]&.include?(action.to_s) || false
  end

  def as_json(options = {})
    super(options.merge(except: [:password_digest]))
  end
end
