class WebApi::V1::AdminPublicationsController < ::ApplicationController
  before_action :set_admin_publication, only: [:update, :reorder]

  def index
    @publications = policy_scope(ProjectHolderOrdering) # .includes(:publication)

    @publications = @publications.where(publication_type: ProjectFolder.name)
      .or(@publications.where(publication: ProjectsFilteringService.new.apply_common_index_filters(
        Pundit.policy_scope(current_user, Project), 
        params)))

    @publications = @publications
      .order(:ordering)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: linked_json(@publications, WebApi::V1::AdminPublicationSerializer, params: fastjson_params)
  end

  def update
    @publication.assign_attributes permitted_attributes(@publication)
    authorize @publication
    if @publication.save
      SideFxAdminPublicationService.new.after_update(@publication, current_user)
      render json: WebApi::V1::AdminPublicationSerializer.new(
        @publication, 
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: { errors: @publication.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    if @publication.insert_at(permitted_attributes(@publication)[:ordering])
      SideFxAdminPublicationService.new.after_update(@publication, current_user)
      render json: WebApi::V1::AdminPublicationSerializer.new(
        @publication, 
        params: fastjson_params, 
        ).serialized_json, status: :ok
    else
      render json: {errors: @publication.errors.details}, status: :unprocessable_entity
    end
  end


  private

  def secure_controller?
    false
  end

  def set_admin_publication
    @publication = AdminPublication.find params[:id]
    authorize @publication
  end

end
