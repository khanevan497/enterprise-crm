module Api
  module V1
    class ContactsController < ApplicationController
      before_action :set_contact, only: [:show, :update, :destroy]

      def index
        contacts = Contact.for_org(current_org_id)
                          .includes(:company, :owner)

        contacts = contacts.where("first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?",
                                  "%#{params[:q]}%", "%#{params[:q]}%", "%#{params[:q]}%") if params[:q].present?
        contacts = contacts.where(status: params[:status]) if params[:status].present?
        contacts = contacts.where(owner_id: params[:owner_id]) if params[:owner_id].present?
        contacts = contacts.where(company_id: params[:company_id]) if params[:company_id].present?

        total = contacts.count
        contacts = contacts.order(created_at: :desc)
                           .page(params[:page]).per(params[:per_page] || 20)

        api_response(data: contacts.map { |c| contact_json(c) }, meta: { total: total, page: params[:page]&.to_i || 1 })
      end

      def show
        api_response(data: contact_json(@contact, detailed: true))
      end

      def create
        contact = Contact.new(contact_params.merge(organization_id: current_org_id))
        if contact.save
          log_audit(action: "contact.created", resource_type: "Contact", resource_id: contact.id, metadata: { name: contact.full_name })
          api_response(data: contact_json(contact), status: :created)
        else
          api_response(error: contact.errors.full_messages.join(", "), status: :unprocessable_entity)
        end
      end

      def update
        if @contact.update(contact_params)
          log_audit(action: "contact.updated", resource_type: "Contact", resource_id: @contact.id)
          api_response(data: contact_json(@contact))
        else
          api_response(error: @contact.errors.full_messages.join(", "), status: :unprocessable_entity)
        end
      end

      def destroy
        @contact.destroy
        log_audit(action: "contact.deleted", resource_type: "Contact", resource_id: @contact.id)
        api_response(data: { message: "Contact deleted" })
      end

      private

      def set_contact
        @contact = Contact.for_org(current_org_id).find_by(id: params[:id])
        api_response(error: "Not found", status: :not_found) unless @contact
      end

      def contact_params
        params.require(:contact).permit(:first_name, :last_name, :email, :phone, :job_title, :status, :company_id, :owner_id)
      end

      def contact_json(contact, detailed: false)
        data = {
          id: contact.id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          full_name: contact.full_name,
          email: contact.email,
          phone: contact.phone,
          job_title: contact.job_title,
          status: contact.status,
          company_id: contact.company_id,
          company_name: contact.company&.name,
          owner_id: contact.owner_id,
          owner_name: contact.owner&.name,
          created_at: contact.created_at,
          updated_at: contact.updated_at
        }

        if detailed
          data[:deals] = contact.deals.for_org(current_org_id).map { |d|
            { id: d.id, title: d.title, stage: d.stage, value: d.value }
          }
          data[:tasks] = contact.tasks.for_org(current_org_id).map { |t|
            { id: t.id, title: t.title, status: t.status, priority: t.priority }
          }
          data[:activities] = contact.activities.for_org(current_org_id).recent.limit(10).map { |a|
            { id: a.id, activity_type: a.activity_type, description: a.description, created_at: a.created_at }
          }
        end

        data
      end
    end
  end
end
