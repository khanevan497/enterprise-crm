require "jwt"

class JsonWebToken
  SECRET = Rails.application.credentials.secret_key_base || ENV.fetch("SECRET_KEY_BASE", "dev_secret_key_for_enterprise_crm_app_#{Rails.env}")
  EXPIRY = 24.hours.to_i

  def self.encode(payload, exp = EXPIRY)
    payload[:exp] = Time.now.to_i + exp
    JWT.encode(payload, SECRET, "HS256")
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET, true, algorithm: "HS256")
    HashWithIndifferentAccess.new(decoded[0])
  rescue JWT::DecodeError, JWT::ExpiredSignature
    nil
  end
end
