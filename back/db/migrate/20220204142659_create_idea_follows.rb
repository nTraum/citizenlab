class CreateIdeaFollows < ActiveRecord::Migration[6.1]
  def change
    create_table :idea_follows, id: :uuid do |t|
      t.integer :follower_id
      t.integer :idea_id

      t.timestamps
    end
  end
end
