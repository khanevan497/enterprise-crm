module Api
  module V1
    class SearchController < ApplicationController
      def index
        q = params[:q]
        return api_response(data: { contacts: [], companies: [], deals: [] }) if q.blank?

        org_id = current_org_id
        like = "%#{q}%"

        contacts = Contact.for_org(org_id)
                          .where("first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?", like, like, like)
                          .limit(5)
                          .map { |c| { id: c.id, type: "contact", name: c.full_name, subtitle: c.email, status: c.status } }

        companies = Company.for_org(org_id)
                           .where("name ILIKE ? OR industry ILIKE ?", like, like)
                           .limit(5)
                           .map { |c| { id: c.id, type: "company", name: c.name, subtitle: c.industry } }

        deals = Deal.for_org(org_id)
                    .where("title ILIKE ?", like)
                    .limit(5)
                    .map { |d| { id: d.id, type: "deal", name: d.title, subtitle: d.stage, value: d.value } }

        api_response(data: { contacts: contacts, companies: companies, deals: deals })
      end
    end
  end
end
