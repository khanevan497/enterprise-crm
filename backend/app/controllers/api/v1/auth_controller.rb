module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [:login]

      def login
        user = User.find_by(email: params[:email]&.downcase)

        if user&.authenticate(params[:password])
          token = JsonWebToken.encode(user_id: user.id)
          log_audit(action: "user.login", resource_type: "User", resource_id: user.id) rescue nil
          api_response(data: { token: token, user: user_json(user) })
        else
          api_response(error: "Invalid email or password", status: :unauthorized)
        end
      end

      def logout
        api_response(data: { message: "Logged out successfully" })
      end

      def me
        api_response(data: user_json(current_user))
      end

      private

      def user_json(user)
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization_id: user.organization_id,
          organization_name: user.organization&.name,
          created_at: user.created_at
        }
      end
    end
  end
end
