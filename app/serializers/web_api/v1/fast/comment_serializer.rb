class WebApi::V1::Fast::CommentSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :upvotes_count, :downvotes_count, :publication_status, :children_count, :created_at, :updated_at

  attribute :body_multiloc do |object|
    if object.publication_status != 'deleted'
      object.body_multiloc
    else
      nil
    end
  end

  attribute :is_admin_comment do |object|
    object.author&.admin?
  end

  belongs_to :idea
  belongs_to :parent

  belongs_to :author, record_type: :user, serializer: WebApi::V1::Fast::UserSerializer do |object|
    if object.publication_status != 'deleted'
      object.author
    else
      nil
    end
  end

  has_one :user_vote, record_type: :vote, serializer: WebApi::V1::Fast::VoteSerializer, if: Proc.new { |object, params|
    signed_in? object, params
  } do |object, params|
    params.dig(:vbci, object.id) || object.votes.where(user: current_user(params)).first
  end
end
