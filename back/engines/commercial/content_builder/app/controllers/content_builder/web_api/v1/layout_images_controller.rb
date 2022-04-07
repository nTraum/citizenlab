module ContentBuilder
  class WebApi::V1::LayoutImagesController < ApplicationController
    def create
      @image = LayoutImage.new image_params
      authorize @image

      sidefx.before_create @image, current_user
      if @image.save
        sidefx.after_create @image, current_user
        render json: WebApi::V1::LayoutImageSerializer.new(
          @image,
          params: fastjson_params
        ).serialized_json, status: :created
      else
        if @image.errors.details[:image].include?({ error: 'processing_error' })
          ErrorReporter.report_msg @image.errors.details.to_s
        end
        render json: { errors: transform_errors_details!(@image.errors.details) }, status: :unprocessable_entity
      end
    end

    private

    def image_params
      params.require(:layout_image).permit(:image)
    end

    def sidefx
      @sidefx ||= SideFxLayoutImageService.new
    end
  end
end
