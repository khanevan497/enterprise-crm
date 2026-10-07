class ApplicationController < ActionController::API
  include ActionController::Cookies

  before_action :authenticate_user!

  attr_reader :current_user

  private

  def authenticate_user!
    token = extract_token
    return render_unauthorized unless token

    payload = JsonWebToken.decode(token)
    return render_unauthorized unless payload

    @current_user = User.find_by(id: payload[:user_id])
    render_unauthorized unless @current_user
  rescue StandardError
    render_unauthorized
  end

  def extract_token
    request.headers["Authorization"]&.split(" ")&.last ||
      cookies[:auth_token]
  end

  def render_unauthorized
    render json: { data: nil, error: "Unauthorized", meta: {} }, status: :unauthorized
  end

  def render_forbidden
    render json: { data: nil, error: "Forbidden", meta: {} }, status: :forbidden
  end

  def current_org_id
    current_user&.organization_id
  end

  def log_audit(action:, resource_type:, resource_id:, metadata: {})
    AuditLog.log(
      organization_id: current_org_id,
      user_id: current_user&.id,
      action: action,
      resource_type: resource_type,
      resource_id: resource_id,
      metadata: metadata,
      ip_address: request.remote_ip
    )
  rescue StandardError => e
    Rails.logger.error("AuditLog failed: #{e.message}")
  end

  def api_response(data: nil, error: nil, meta: {}, status: :ok)
    render json: { data: data, error: error, meta: meta }, status: status
  end
end
