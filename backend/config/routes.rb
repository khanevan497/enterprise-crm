Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # Auth
      post "auth/login",  to: "auth#login"
      post "auth/logout", to: "auth#logout"
      get  "me",          to: "auth#me"

      # CRM resources
      resources :contacts
      resources :companies
      resources :deals
      resources :tasks
      resources :activities, only: [:index, :create, :show]
      resources :audit_logs, only: [:index, :show]

      # Dashboard
      get "dashboard", to: "dashboard#index"

      # Search
      get "search", to: "search#index"

      # AI
      post "ai/customer-insight", to: "ai#customer_insight"
      post "ai/chat",             to: "ai#chat"
    end
  end
end
