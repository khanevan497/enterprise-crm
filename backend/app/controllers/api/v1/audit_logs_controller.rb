module Api
  module V1
    class AuditLogsController < ApplicationController
      def index
        logs = AuditLog.for_org(current_org_id).includes(:user).recent
        logs = logs.where(user_id: params[:user_id]) if params[:user_id].present?
        logs = logs.where(action: params[:action]) if params[:action].present?
        logs = logs.where(resource_type: params[:resource_type]) if params[:resource_type].present?
        logs = logs.where("created_at >= ?", params[:from]) if params[:from].present?
        logs = logs.where("created_at <= ?", params[:to]) if params[:to].present?

        total = logs.count
        logs = logs.page(params[:page]).per(50)

        api_response(data: logs.map { |l| log_json(l) }, meta: { total: total })
      end

      def show
        log = AuditLog.for_org(current_org_id).find_by(id: params[:id])
        return api_response(error: "Not found", status: :not_found) unless log

        api_response(data: log_json(log))
      end

      private

      def log_json(log)
        {
          id: log.id,
          action: log.action,
          resource_type: log.resource_type,
          resource_id: log.resource_id,
          user_id: log.user_id,
          user_name: log.user&.name,
          metadata: log.metadata,
          ip_address: log.ip_address,
          created_at: log.created_at
        }
      end
    end
  end
end
