require 'rails_helper'
require 'rspec_api_documentation/dsl'

describe 'When attempting to create an Idea in a timeline Project', type: :request do
  include ActiveSupport::Testing::TimeHelpers

  let(:project) { create(:project_with_active_ideation_phase) }
  let(:user) { create(:user) }

  let(:token) { Knock::AuthToken.new(payload: user.to_token_payload).token }
  let(:headers) { { 'CONTENT_TYPE' => 'application/json', 'AUTHORIZATION' => "Bearer #{token}" } }
  let(:params) {
    { idea:
      { author_id: user.id,
        project_id: project.id,
        publication_status: "published",
        title_multiloc: {en: "idea in timeline"},
        body_multiloc: {en: "body text"},
        idea_status_id: IdeaStatus.last.id
      }
    }
  }

  before do
    project.phases.first.update!(start_at: '2022-01-17', end_at: '2022-01-19')
    IdeaStatus.create_defaults
  end

  context 'and platform timezone is set to UTC+0' do
    before do
      settings = AppConfiguration.instance.settings
      settings['core']['timezone'] = 'UTC'
      AppConfiguration.instance.update!(settings: settings)
    end

    it 'does not create an idea just before ideation phase starts' do    
      travel_to('2022-01-16 23:59:00 +0000'.to_datetime) do
        expect(Time.now.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_s).to eq('2022-01-16 23:59:00 UTC')

        post '/web_api/v1/ideas',
          params: params.to_json,
          headers: headers

        expect(status).to eq(401) # Unauthorized
      end
    end

    it 'creates an idea just after ideation phase starts' do    
      travel_to('2022-01-18 00:01:00 +0000'.to_datetime) do
        expect(Time.now.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_s).to eq('2022-01-18 00:01:00 UTC')

        post '/web_api/v1/ideas',
          params: params.to_json,
          headers: headers

        expect(status).to eq(201) # Created
        expect(Time.now.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_s).to eq('2022-01-18 00:01:00 UTC')
      end
    end

    it 'creates an idea just before ideation phase ends' do    
      travel_to('2022-01-18 23:59:00 +0000'.to_datetime) do
        expect(Time.now.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_s).to eq('2022-01-18 23:59:00 UTC')

        post '/web_api/v1/ideas',
          params: params.to_json,
          headers: headers

        expect(status).to eq(201) # Created
      end
    end

    it 'does not create an idea when ideation phase has just ended' do       
      travel_to('2022-01-20 00:00:00 +0000'.to_datetime) do
        expect(Time.now.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_s).to eq('2022-01-20 00:00:00 UTC')

        post '/web_api/v1/ideas',
          params: params.to_json,
          headers: headers

        expect(status).to eq(401) # Unauthorized
      end
    end
  end

  # ==========================================================================

  context 'and platform timezone is set to UTC-4' do
    before do
      settings = AppConfiguration.instance.settings
      settings['core']['timezone'] = 'Puerto Rico' # Timezone remains at UTC-4 all year round, with no seasonal clock changes
      AppConfiguration.instance.update!(settings: settings)
    end

    it 'it does not create an idea just before ideation phase starts' do    
      travel_to('2022-01-16 23:59:00 -0400'.to_datetime) do
        expect(Time.now.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_s).to eq('2022-01-16 23:59:00 -0400')

        post '/web_api/v1/ideas',
          params: params.to_json,
          headers: headers

        expect(status).to eq(401) # Unauthorized
      end
    end

    # This was the case that seemed to fail when testing via FE (on localhost)
    it 'creates an idea just after ideation phase starts' do    
      travel_to('2022-01-18 00:01:00 -0400'.to_datetime) do
        expect(Time.now.in_time_zone(AppConfiguration.instance.settings('core', 'timezone'))).to eq('2022-01-18 00:01:00 -0400')

        post '/web_api/v1/ideas',
          params: params.to_json,
          headers: headers

        expect(status).to eq(201) # Created
      end
    end

    it 'creates an idea just before phase ends' do    
      travel_to('2022-01-18 23:59:00 -0400'.to_datetime) do
        expect(Time.now.in_time_zone(AppConfiguration.instance.settings('core', 'timezone')).to_s).to eq('2022-01-18 23:59:00 -0400')

        post '/web_api/v1/ideas',
          params: params.to_json,
          headers: headers

        expect(status).to eq(201) # Created
      end
    end

    it 'does not create an idea when ideation phase has just ended' do       
      travel_to('2022-01-20 00:00:00 -0400'.to_datetime) do
        expect(Time.now.in_time_zone(AppConfiguration.instance.settings('core', 'timezone'))).to eq('2022-01-20 00:00:00 -0400')

        post '/web_api/v1/ideas',
          params: params.to_json,
          headers: headers

        expect(status).to eq(401) # Unauthorized
      end
    end
  end  
end

# ====================================================================================================
# TODO: Test posting comments to ideas in ideation phase of timeline project
# Not super-urgent at this point, as this case did not fail when manually tested via FE (on localhost)
# ====================================================================================================