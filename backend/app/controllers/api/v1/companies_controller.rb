module Api
  module V1
    class CompaniesController < ApplicationController
      before_action :set_company, only: [:show, :update, :destroy]

      def index
        companies = Company.for_org(current_org_id).includes(:contacts, :deals)
        companies = companies.where("name ILIKE ?", "%#{params[:q]}%") if params[:q].present?
        companies = companies.where(industry: params[:industry]) if params[:industry].present?

        total = companies.count
        companies = companies.order(name: :asc).page(params[:page]).per(params[:per_page] || 20)

        api_response(data: companies.map { |c| company_json(c) }, meta: { total: total })
      end

      def show
        api_response(data: company_json(@company, detailed: true))
      end

      def create
        company = Company.new(company_params.merge(organization_id: current_org_id))
        if company.save
          log_audit(action: "company.created", resource_type: "Company", resource_id: company.id, metadata: { name: company.name })
          api_response(data: company_json(company), status: :created)
        else
          api_response(error: company.errors.full_messages.join(", "), status: :unprocessable_entity)
        end
      end

      def update
        if @company.update(company_params)
          log_audit(action: "company.updated", resource_type: "Company", resource_id: @company.id)
          api_response(data: company_json(@company))
        else
          api_response(error: @company.errors.full_messages.join(", "), status: :unprocessable_entity)
        end
      end

      def destroy
        @company.destroy
        log_audit(action: "company.deleted", resource_type: "Company", resource_id: @company.id)
        api_response(data: { message: "Company deleted" })
      end

      private

      def set_company
        @company = Company.for_org(current_org_id).find_by(id: params[:id])
        api_response(error: "Not found", status: :not_found) unless @company
      end

      def company_params
        params.require(:company).permit(:name, :industry, :website, :phone, :description)
      end

      def company_json(company, detailed: false)
        data = {
          id: company.id,
          name: company.name,
          industry: company.industry,
          website: company.website,
          phone: company.phone,
          description: company.description,
          contacts_count: company.contacts.count,
          deals_count: company.deals.count,
          total_pipeline_value: company.deals.for_org(current_org_id).sum(:value),
          created_at: company.created_at,
          updated_at: company.updated_at
        }

        if detailed
          data[:contacts] = company.contacts.for_org(current_org_id).map { |c|
            { id: c.id, full_name: c.full_name, email: c.email, status: c.status }
          }
          data[:deals] = company.deals.for_org(current_org_id).map { |d|
            { id: d.id, title: d.title, stage: d.stage, value: d.value }
          }
          data[:activities] = company.activities.for_org(current_org_id).recent.limit(10).map { |a|
            { id: a.id, activity_type: a.activity_type, description: a.description, created_at: a.created_at }
          }
        end

        data
      end
    end
  end
end
