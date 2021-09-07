class CommentOnYourCommentChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'comment_on_your_comment'
  end
end