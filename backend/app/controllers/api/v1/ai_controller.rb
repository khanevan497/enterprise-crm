module Api
  module V1
    class AiController < ApplicationController
      AI_SERVICE_URL = ENV.fetch("AI_SERVICE_URL", "http://localhost:8000")

      def customer_insight
        contact_id = params[:contact_id]
        company_id = params[:company_id]

        context = build_context(contact_id: contact_id, company_id: company_id)

        begin
          response = Net::HTTP.post(
            URI("#{AI_SERVICE_URL}/insights"),
            { context: context }.to_json,
            "Content-Type" => "application/json"
          )
          result = JSON.parse(response.body)
          api_response(data: result)
        rescue StandardError
          api_response(data: mock_insight(context))
        end
      end

      def chat
        message = params[:message]
        contact_id = params[:contact_id]
        company_id = params[:company_id]

        context = build_context(contact_id: contact_id, company_id: company_id)

        begin
          response = Net::HTTP.post(
            URI("#{AI_SERVICE_URL}/chat"),
            { message: message, context: context }.to_json,
            "Content-Type" => "application/json"
          )
          result = JSON.parse(response.body)
          api_response(data: result)
        rescue StandardError
          api_response(data: { reply: mock_chat_reply(message, context) })
        end
      end

      private

      def build_context(contact_id: nil, company_id: nil)
        org_id = current_org_id
        context = {}

        if contact_id.present?
          contact = Contact.for_org(org_id).find_by(id: contact_id)
          if contact
            context[:contact] = {
              name: contact.full_name,
              email: contact.email,
              status: contact.status,
              job_title: contact.job_title
            }
            context[:deals] = contact.deals.for_org(org_id).map { |d|
              { title: d.title, stage: d.stage, value: d.value }
            }
            context[:activities] = contact.activities.for_org(org_id).recent.limit(10).map { |a|
              { type: a.activity_type, description: a.description, date: a.created_at }
            }
            context[:tasks] = contact.tasks.for_org(org_id).map { |t|
              { title: t.title, status: t.status, priority: t.priority }
            }
          end
        end

        if company_id.present?
          company = Company.for_org(org_id).find_by(id: company_id)
          if company
            context[:company] = { name: company.name, industry: company.industry }
            context[:contacts] = company.contacts.for_org(org_id).count
            context[:total_pipeline] = company.deals.for_org(org_id).sum(:value)
          end
        end

        context
      end

      def mock_insight(context)
        name = context.dig(:contact, :name) || context.dig(:company, :name) || "this customer"
        {
          summary: "#{name} is an active prospect showing strong engagement. Recent deal activity indicates high purchase intent.",
          status: "High-value prospect currently in proposal stage.",
          risks: ["No response in 3 days", "Competitor evaluation mentioned"],
          important_events: ["Proposal sent last week", "Pricing discussion initiated"],
          recommended_actions: ["Follow up with decision maker", "Offer a product demo", "Send revised pricing"]
        }
      end

      def mock_chat_reply(message, context)
        name = context.dig(:contact, :name) || "this customer"
        "Based on the CRM data for #{name}: The customer has been engaged for several months with 3 active deals in the pipeline. Recent activity shows a pricing objection that should be addressed. I recommend scheduling a follow-up call this week."
      end
    end
  end
end
