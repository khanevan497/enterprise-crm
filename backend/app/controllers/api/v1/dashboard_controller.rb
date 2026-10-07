module Api
  module V1
    class DashboardController < ApplicationController
      def index
        org_id = current_org_id

        # KPI cards
        total_contacts = Contact.for_org(org_id).count
        active_deals = Deal.for_org(org_id).active.count
        pipeline_value = Deal.for_org(org_id).active.sum(:value)
        won_revenue = Deal.for_org(org_id).where(stage: "closed_won").sum(:value)

        # Deals by stage
        deals_by_stage = Deal.for_org(org_id)
                             .group(:stage)
                             .select("stage, COUNT(*) as count, COALESCE(SUM(value), 0) as total_value")
                             .map { |r| { stage: r.stage, count: r.count, total_value: r.total_value } }

        # Monthly revenue (last 6 months)
        monthly_revenue = Deal.for_org(org_id)
                              .where(stage: "closed_won")
                              .where("created_at >= ?", 6.months.ago)
                              .group("DATE_TRUNC('month', created_at)")
                              .sum(:value)
                              .map { |k, v| { month: k.strftime("%b %Y"), value: v } }
                              .sort_by { |m| m[:month] }

        # New contacts by month (last 6 months)
        new_contacts = Contact.for_org(org_id)
                              .where("created_at >= ?", 6.months.ago)
                              .group("DATE_TRUNC('month', created_at)")
                              .count
                              .map { |k, v| { month: k.strftime("%b %Y"), count: v } }
                              .sort_by { |m| m[:month] }

        # Recent activities
        recent_activities = Activity.for_org(org_id)
                                    .includes(:user, :contact, :deal)
                                    .recent
                                    .limit(10)
                                    .map { |a|
                                      {
                                        id: a.id,
                                        type: a.activity_type,
                                        description: a.description,
                                        user_name: a.user&.name,
                                        created_at: a.created_at
                                      }
                                    }

        api_response(data: {
          kpis: {
            total_contacts: total_contacts,
            active_deals: active_deals,
            pipeline_value: pipeline_value,
            won_revenue: won_revenue
          },
          deals_by_stage: deals_by_stage,
          monthly_revenue: monthly_revenue,
          new_contacts_over_time: new_contacts,
          recent_activities: recent_activities
        })
      end
    end
  end
end
