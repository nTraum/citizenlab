# frozen_string_literal: true

module Insights
  module WebApi::V1
    class ViewsController < ::ApplicationController
      skip_after_action :verify_authorized, only: [:create]

      def show
        render json: serialize(view), status: :ok
      end

      def index
        views = policy_scope(Insights::View.includes(:data_sources)).order(created_at: :desc)
        render json: serialize(views)
      end

      def create
        view = Insights::Views::CreateService.new(current_user, create_params).execute
        if view.valid?
          render json: serialize(view), status: :created
        else
          render json: { errors: view.errors.details }, status: :unprocessable_entity
        end
      end

      def update
        if view.update(update_params)
          render json: serialize(view), status: :ok
        else
          render json: { errors: view.errors.details }, status: :unprocessable_entity
        end
      end

      def destroy
        status = view.destroy ? :ok : 500
        head status
      end

      private

      def create_params
        @create_params ||= {
          name: params.require(:view)[:name],
          data_sources: [
            { origin_id: params.require(:view)[:scope_id], origin_type: 'Project' }
          ]
        }
      end

      def update_params
        @update_params ||= params.require(:view).permit(:name)
      end

      # @param views One view or a collection of views
      def serialize(views)
        options = {
          include: [:scope],
          params: fastjson_params
        }

        Insights::WebApi::V1::ViewSerializer.new(views, options).serialized_json
      end

      def view
        @view ||= authorize(View.includes(:data_sources).find(params[:id]))
      end
    end
  end
end
