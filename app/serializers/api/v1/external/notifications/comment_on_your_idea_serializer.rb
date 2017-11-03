class Api::V1::External::Notifications::CommentOnYourIdeaSerializer < Api::V1::External::Notifications::NotificationSerializer
  belongs_to :user, serializer: CustomUserSerializer
  belongs_to :comment, serializer: CustomCommentSerializer
  belongs_to :comment_author, serializer: CustomUserSerializer
  belongs_to :idea, serializer: CustomIdeaSerializer
  belongs_to :idea_author, serializer: CustomUserSerializer
  has_many :idea_images, serializer: CustomImageSerializer
  belongs_to :project, serializer: CustomProjectSerializer
  has_many :project_images, serializer: CustomImageSerializer

end