class Deal < ApplicationRecord
  belongs_to :organization
  belongs_to :company, optional: true
  belongs_to :contact, optional: true
  belongs_to :owner, class_name: "User", optional: true
  has_many :activities, dependent: :nullify
  has_many :tasks, dependent: :nullify

  STAGES = %w[lead qualified proposal negotiation closed_won closed_lost].freeze

  validates :title, presence: true
  validates :stage, inclusion: { in: STAGES }
  validates :organization_id, presence: true

  scope :for_org, ->(org_id) { where(organization_id: org_id) }
  scope :active, -> { where.not(stage: %w[closed_won closed_lost]) }

  before_update :track_stage_change

  private

  def track_stage_change
    return unless stage_changed?
    @previous_stage = stage_was
  end

  after_update :create_stage_activity, if: -> { saved_change_to_stage? }

  def create_stage_activity
    Activity.create!(
      organization_id: organization_id,
      deal_id: id,
      activity_type: "deal_update",
      description: "Deal moved from #{stage_before_last_save} to #{stage}",
      metadata: { from_stage: stage_before_last_save, to_stage: stage }
    )
  end
end
