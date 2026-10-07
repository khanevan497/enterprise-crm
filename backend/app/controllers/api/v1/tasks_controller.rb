module Api
  module V1
    class TasksController < ApplicationController
      before_action :set_task, only: [:show, :update, :destroy]

      def index
        tasks = Task.for_org(current_org_id).includes(:assignee, :creator, :contact, :deal)
        tasks = tasks.where(assigned_to: params[:assigned_to]) if params[:assigned_to].present?
        tasks = tasks.where(status: params[:status]) if params[:status].present?
        tasks = tasks.where(priority: params[:priority]) if params[:priority].present?
        tasks = tasks.where(contact_id: params[:contact_id]) if params[:contact_id].present?
        tasks = tasks.where(deal_id: params[:deal_id]) if params[:deal_id].present?

        total = tasks.count
        tasks = tasks.order(due_at: :asc).page(params[:page]).per(20)
        api_response(data: tasks.map { |t| task_json(t) }, meta: { total: total })
      end

      def show
        api_response(data: task_json(@task))
      end

      def create
        task = Task.new(task_params.merge(organization_id: current_org_id, created_by: current_user.id))
        if task.save
          log_audit(action: "task.created", resource_type: "Task", resource_id: task.id, metadata: { title: task.title })
          api_response(data: task_json(task), status: :created)
        else
          api_response(error: task.errors.full_messages.join(", "), status: :unprocessable_entity)
        end
      end

      def update
        if @task.update(task_params)
          log_audit(action: "task.updated", resource_type: "Task", resource_id: @task.id)
          api_response(data: task_json(@task))
        else
          api_response(error: @task.errors.full_messages.join(", "), status: :unprocessable_entity)
        end
      end

      def destroy
        @task.destroy
        api_response(data: { message: "Task deleted" })
      end

      private

      def set_task
        @task = Task.for_org(current_org_id).find_by(id: params[:id])
        api_response(error: "Not found", status: :not_found) unless @task
      end

      def task_params
        params.require(:task).permit(:title, :description, :status, :priority, :due_at, :assigned_to, :contact_id, :deal_id)
      end

      def task_json(task)
        {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_at: task.due_at,
          assigned_to: task.assigned_to,
          assignee_name: task.assignee&.name,
          contact_id: task.contact_id,
          contact_name: task.contact&.full_name,
          deal_id: task.deal_id,
          deal_title: task.deal&.title,
          created_at: task.created_at,
          updated_at: task.updated_at
        }
      end
    end
  end
end
