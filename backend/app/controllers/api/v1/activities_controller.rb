module Api
  module V1
    class ActivitiesController < ApplicationController
      def index
        activities = Activity.for_org(current_org_id)
                             .includes(:user, :contact, :company, :deal)
                             .recent

        activities = activities.where(activity_type: params[:type]) if params[:type].present?
        activities = activities.where(contact_id: params[:contact_id]) if params[:contact_id].present?
        activities = activities.where(deal_id: params[:deal_id]) if params[:deal_id].present?

        total = activities.count
        activities = activities.limit(50)
        api_response(data: activities.map { |a| activity_json(a) }, meta: { total: total })
      end

      def show
        activity = Activity.for_org(current_org_id).find_by(id: params[:id])
        return api_response(error: "Not found", status: :not_found) unless activity

        api_response(data: activity_json(activity))
      end

      def create
        activity = Activity.new(activity_params.merge(organization_id: current_org_id, user_id: current_user.id))
        if activity.save
          api_response(data: activity_json(activity), status: :created)
        else
          api_response(error: activity.errors.full_messages.join(", "), status: :unprocessable_entity)
        end
      end

      private

      def activity_params
        params.require(:activity).permit(:activity_type, :description, :contact_id, :company_id, :deal_id, metadata: {})
      end

      def activity_json(a)
        {
          id: a.id,
          activity_type: a.activity_type,
          description: a.description,
          user_id: a.user_id,
          user_name: a.user&.name,
          contact_id: a.contact_id,
          contact_name: a.contact&.full_name,
          company_id: a.company_id,
          company_name: a.company&.name,
          deal_id: a.deal_id,
          deal_title: a.deal&.title,
          metadata: a.metadata,
          created_at: a.created_at
        }
      end
    end
  end
end
