module EmailCampaigns::Campaigns
	class CommentMarkedAsSpamSerializer < NotificationSerializer
	  belongs_to :initiating_user, serializer: CustomUserSerializer
	  belongs_to :spam_report, serializer: CustomSpamReportSerializer
	  belongs_to :comment, serializer: CustomCommentSerializer
	  belongs_to :idea, serializer: CustomIdeaSerializer
	  has_many :idea_images, serializer: CustomImageSerializer
	  belongs_to :project, serializer: CustomProjectSerializer
	  has_many :project_images, serializer: CustomImageSerializer
	end
end