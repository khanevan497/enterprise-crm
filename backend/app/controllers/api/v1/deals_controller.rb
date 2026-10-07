module Api
  module V1
    class DealsController < ApplicationController
      before_action :set_deal, only: [:show, :update, :destroy]

      def index
        deals = Deal.for_org(current_org_id).includes(:company, :contact, :owner)
        deals = deals.where("title ILIKE ?", "%#{params[:q]}%") if params[:q].present?
        deals = deals.where(stage: params[:stage]) if params[:stage].present?
        deals = deals.where(owner_id: params[:owner_id]) if params[:owner_id].present?

        total = deals.count
        deals = deals.order(created_at: :desc).page(params[:page]).per(params[:per_page] || 50)

        api_response(data: deals.map { |d| deal_json(d) }, meta: { total: total })
      end

      def show
        api_response(data: deal_json(@deal, detailed: true))
      end

      def create
        deal = Deal.new(deal_params.merge(organization_id: current_org_id, owner_id: current_user.id))
        if deal.save
          log_audit(action: "deal.created", resource_type: "Deal", resource_id: deal.id, metadata: { title: deal.title })
          api_response(data: deal_json(deal), status: :created)
        else
          api_response(error: deal.errors.full_messages.join(", "), status: :unprocessable_entity)
        end
      end

      def update
        old_stage = @deal.stage
        if @deal.update(deal_params)
          if old_stage != @deal.stage
            log_audit(action: "deal.stage_changed", resource_type: "Deal", resource_id: @deal.id,
                      metadata: { from: old_stage, to: @deal.stage })
          else
            log_audit(action: "deal.updated", resource_type: "Deal", resource_id: @deal.id)
          end
          api_response(data: deal_json(@deal))
        else
          api_response(error: @deal.errors.full_messages.join(", "), status: :unprocessable_entity)
        end
      end

      def destroy
        @deal.destroy
        log_audit(action: "deal.deleted", resource_type: "Deal", resource_id: @deal.id)
        api_response(data: { message: "Deal deleted" })
      end

      private

      def set_deal
        @deal = Deal.for_org(current_org_id).find_by(id: params[:id])
        api_response(error: "Not found", status: :not_found) unless @deal
      end

      def deal_params
        params.require(:deal).permit(:title, :value, :currency, :stage, :probability, :expected_close_date, :company_id, :contact_id, :owner_id)
      end

      def deal_json(deal, detailed: false)
        {
          id: deal.id,
          title: deal.title,
          value: deal.value,
          currency: deal.currency || "USD",
          stage: deal.stage,
          probability: deal.probability,
          expected_close_date: deal.expected_close_date,
          company_id: deal.company_id,
          company_name: deal.company&.name,
          contact_id: deal.contact_id,
          contact_name: deal.contact&.full_name,
          owner_id: deal.owner_id,
          owner_name: deal.owner&.name,
          created_at: deal.created_at,
          updated_at: deal.updated_at
        }
      end
    end
  end
end
